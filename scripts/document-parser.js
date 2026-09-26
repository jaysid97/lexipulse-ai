/**
 * LexiPulse AI - Document Ingestion & Clause Parser
 * Intelligently chunks raw contract text into structured clauses with semantic categorization.
 */

const DocumentParser = {
  /**
   * Parse arbitrary legal contract text into structured object
   */
  parseRawText(rawText, userTitle = "Custom User Contract") {
    if (!rawText || !rawText.trim()) {
      throw new Error("Contract text cannot be empty.");
    }

    const lines = rawText.split(/\r?\n/);
    let title = userTitle;
    let parties = "Extracted from document content";
    let effectiveDate = "Not specified in document";

    // Detect Title from first few lines if available
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      if (line.length > 5 && line.length < 80 && !line.startsWith("Section") && !line.startsWith("Article")) {
        if (/agreement|contract|lease|policy|terms|nda/i.test(line)) {
          title = line.replace(/^[#*\s]+|[#*\s]+$/g, "");
          break;
        }
      }
    }

    // Detect Parties
    const partyMatch = rawText.match(/between\s+([^,\n]+)(?:,\s*and|\s+and)\s+([^,\n\.\;]+)/i);
    if (partyMatch) {
      parties = `${partyMatch[1].trim()} & ${partyMatch[2].trim()}`;
    }

    // Detect Effective Date
    const dateMatch = rawText.match(/(?:effective|dated|as of)(?:\s+date)?[:\s]+([A-Z][a-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    if (dateMatch) {
      effectiveDate = dateMatch[1];
    }

    // Chunk into clauses by Section / Article / Numbered regex
    const clauses = this.extractClauses(rawText);

    return {
      id: "custom-" + Date.now(),
      title: title,
      category: this.detectCategory(rawText),
      parties: parties,
      effectiveDate: effectiveDate,
      summary: `Parsed contract with ${clauses.length} distinct clauses. Analyzed for potential risk vectors and clarity.`,
      clauses: clauses,
      suggestedQuestions: this.generateSmartQuestions(clauses)
    };
  },

  /**
   * Extract clauses using regex boundary detection
   */
  extractClauses(text) {
    // Regex for Section 1., 1.1, Article I, etc.
    const sectionPattern = /(?:^|\n\n)(?:(Section|Article|\d+\.|\([a-z]\))\s*([\d\.]+|[IVXLCDM]+)?[:\.\-\s]*([^\n]+)?)\n/gi;
    const matches = [];
    let match;

    while ((match = sectionPattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        prefix: match[1] || "Clause",
        num: match[2] || "",
        headerTitle: (match[3] || "").trim()
      });
    }

    const clauses = [];

    if (matches.length >= 2) {
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
        const chunk = text.substring(start, end).trim();

        const numLabel = `${matches[i].prefix} ${matches[i].num}`.trim();
        const clauseTitle = matches[i].headerTitle || this.inferClauseTitle(chunk);

        clauses.push(this.enrichClause(chunk, `c-${i + 1}`, numLabel, clauseTitle));
      }
    } else {
      // Fallback: Split by double newline paragraphs if no explicit section headers
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 40);
      paragraphs.forEach((p, idx) => {
        const inferredTitle = this.inferClauseTitle(p);
        clauses.push(this.enrichClause(p.trim(), `c-${idx + 1}`, `Section ${idx + 1}`, inferredTitle));
      });
    }

    return clauses;
  },

  /**
   * Infer clause title and category from keywords
   */
  inferClauseTitle(text) {
    if (/indemnif|hold harmless|defend/i.test(text)) return "Indemnification & Liability Allocation";
    if (/non-compete|compete|restraint|solicit/i.test(text)) return "Restrictive Covenants & Non-Compete";
    if (/intellectual property|invention|work for hire|patent|copyright/i.test(text)) return "Intellectual Property Ownership";
    if (/terminat|cancel|cure period|convenience/i.test(text)) return "Termination & Notice Periods";
    if (/payment|fee|invoice|late charge|due date|interest/i.test(text)) return "Compensation & Payment Obligations";
    if (/confidential|non-disclosure|proprietary/i.test(text)) return "Confidentiality & Data Protection";
    if (/arbitrat|jurisdiction|governing law|dispute|venue/i.test(text)) return "Dispute Resolution & Governing Law";
    if (/rent|deposit|premises|tenant|landlord/i.test(text)) return "Tenancy & Security Deposit Terms";
    return "Contractual Covenant";
  },

  /**
   * Enrich raw clause with risk scoring, categories, and plain English translation
   */
  enrichClause(text, id, number, title) {
    const category = this.inferClauseTitle(text);
    const riskAnalysis = this.analyzeClauseRisk(text, category);

    return {
      id: id,
      number: number,
      title: title,
      category: category,
      riskLevel: riskAnalysis.level,
      riskScore: riskAnalysis.score,
      originalText: text,
      plainEnglish: riskAnalysis.plainEnglish,
      actionInsight: riskAnalysis.actionInsight
    };
  },

  /**
   * Risk heuristic analysis
   */
  analyzeClauseRisk(text, category) {
    let score = 25; // baseline safe
    let level = "low";
    let flags = [];

    // Red flag keywords
    if (/indemnif.*unlimited|hold harmless.*any and all|sole discretion/i.test(text)) {
      score += 45;
      flags.push("Unilateral or uncapped liability burden");
    }
    if (/non-compete.*worldwide|shall not.*compete|refrain from.*business/i.test(text)) {
      score += 55;
      flags.push("Restricts future employment or livelihood");
    }
    if (/assign.*all.*invention.*whether or not|pre-existing/i.test(text)) {
      score += 50;
      flags.push("Overreaching IP assignment of personal inventions");
    }
    if (/enter.*without notice|unannounced|any hour/i.test(text)) {
      score += 60;
      flags.push("Eliminates statutory notice rights or privacy");
    }
    if (/waive.*jury trial|binding confidential arbitration|class action waiver/i.test(text)) {
      score += 30;
      flags.push("Waives public courtroom dispute resolution");
    }
    if (/net 90|late fee.*20%|non-refundable/i.test(text)) {
      score += 35;
      flags.push("Unfavorable payment delay or punitive fee");
    }

    score = Math.min(score, 98);

    if (score >= 75) level = "high";
    else if (score >= 50) level = "med";
    else level = "low";

    // Generate plain-English translation
    const plainEnglish = {
      easy: `In simple terms: ${this.summarizeSimple(text, flags)}`,
      standard: `Analysis: This provision addresses ${category.toLowerCase()}. ${flags.length ? 'Primary concern: ' + flags.join('; ') : 'This clause follows standard commercial terms.'}`,
      legal: `Legal Note: Formal contractual stipulation affecting rights under ${category}. Evaluated risk severity: ${level.toUpperCase()}.`
    };

    const actionInsight = level === "high"
      ? `🚨 High Risk: Consider pushing back or seeking counsel regarding ${flags[0] || 'unbalanced terms'}.`
      : level === "med"
      ? `⚠️ Caution: Review terms carefully. Ensure notice windows and obligations are mutual.`
      : `✅ Standard: Appears standard and commercially balanced.`;

    return { score, level, plainEnglish, actionInsight };
  },

  summarizeSimple(text, flags) {
    if (flags.length > 0) {
      return `Watch out: ${flags.join(' and ')}. Make sure you agree to this before signing.`;
    }
    if (text.length > 150) {
      return text.substring(0, 140) + "...";
    }
    return text;
  },

  detectCategory(text) {
    if (/lease|tenant|landlord|premises/i.test(text)) return "Real Estate & Tenancy";
    if (/employee|employer|employment|salary/i.test(text)) return "Employment & Labor";
    if (/consultant|contractor|deliverable|client/i.test(text)) return "Independent Contractor & Consulting";
    if (/software|saas|subscriber|cloud/i.test(text)) return "Software & Cloud Services";
    if (/nda|confidential|disclosure/i.test(text)) return "Confidentiality & NDA";
    return "Commercial Agreement";
  },

  generateSmartQuestions(clauses) {
    const questions = [
      "What are the main risks I should be worried about in this agreement?",
      "Can either party terminate this contract early without penalties?",
      "What are the payment terms and are there any late fees?"
    ];
    if (clauses.some(c => /indemnif/i.test(c.category))) {
      questions.push("Is my liability capped or unlimited under the indemnification clause?");
    }
    if (clauses.some(c => /intellectual property|invention/i.test(c.category))) {
      questions.push("Who owns the intellectual property and inventions I create?");
    }
    return questions;
  }
};
