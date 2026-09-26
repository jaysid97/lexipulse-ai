/**
 * LexiPulse AI - Core Legal Intelligence & Decision Support Engine
 * Evaluates fairness metrics, generates attorney briefs, counter-proposals, and grounded Q&A.
 * 
 * Features:
 * - Normalized weighted fairness scoring & 5-vector safety diagnostics
 * - Grounded contextual semantic search with boundary-aware token matching & stop-word filtering
 * - Attorney Consultation Brief generator with clause-specific strategic questions
 * - Counter-Proposal negotiation generator with commercial redline language & rationales
 * - Context-aware compliance & deadlines checklist generator with collision-free task keys
 * - Contract predatory pattern detection & plain-English executive summarization
 */

const LegalEngine = {
  // Common English stop words to filter out during question parsing
  _stopWords: new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "from", "up", "down", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did", "can",
    "could", "will", "would", "shall", "should", "may", "might", "must", "that",
    "this", "these", "those", "what", "which", "who", "whom", "whose", "when",
    "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "just", "if", "there", "their", "theirs", "they",
    "them", "your", "yours", "you", "i", "me", "my", "myself", "we", "our",
    "ours", "ourselves", "tell", "explain", "does", "want", "know", "please"
  ]),

  // Short legal & domain keywords that MUST NOT be discarded by length filters
  _shortKeywords: new Set([
    "fee", "fees", "pay", "due", "sue", "pet", "tax", "nda", "ip", "law",
    "cap", "ac", "hvac", "rent", "cure", "term", "cost", "fine", "loss",
    "mold", "leak", "roof", "keys", "code", "work", "quit", "fire", "sign"
  ]),

  // --- Internal Utilities ---

  _safeString(val, fallback = "") {
    if (val === null || val === undefined) return fallback;
    return String(val).trim();
  },

  _getClauseExplanation(clause, level = "standard") {
    if (!clause) return "";
    if (typeof clause.plainEnglish === "object" && clause.plainEnglish !== null) {
      return clause.plainEnglish[level] || clause.plainEnglish.standard || clause.plainEnglish.easy || clause.plainEnglish.legal || "";
    }
    if (typeof clause.plainEnglish === "string") {
      return clause.plainEnglish;
    }
    if (clause.originalText) {
      return clause.originalText.length > 180 
        ? clause.originalText.substring(0, 180).trim() + "..." 
        : clause.originalText;
    }
    return "Standard contractual covenant.";
  },

  _getClauseInsight(clause) {
    if (clause && typeof clause.actionInsight === "string" && clause.actionInsight.trim()) {
      return clause.actionInsight.trim();
    }
    const level = clause ? clause.riskLevel : "low";
    if (level === "high") {
      return "🚨 High Risk: Consider pushing back or seeking legal counsel regarding unbalanced exposure.";
    } else if (level === "med") {
      return "⚠️ Caution: Review terms carefully. Ensure notice windows and obligations are mutual.";
    }
    return "✅ Standard: Conforms to typical commercial standards.";
  },

  _getNumericRiskScore(clause) {
    if (!clause) return 30;
    if (typeof clause.riskScore === "number" && !isNaN(clause.riskScore)) {
      return Math.max(0, Math.min(100, Math.round(clause.riskScore)));
    }
    if (clause.riskLevel === "high") return 85;
    if (clause.riskLevel === "med") return 60;
    return 25;
  },

  _truncate(text, maxLen = 150) {
    const s = this._safeString(text);
    if (s.length <= maxLen) return s;
    return s.substring(0, maxLen).trim() + "...";
  },

  _cleanPunctuation(str) {
    return str.replace(/[^\w\s\-]/g, " ").replace(/\s+/g, " ").trim();
  },

  /**
   * Intelligently categorizes a clause into one of the 5 primary risk vectors:
   * 'liability', 'ip', 'financial', 'termination', 'dispute' or 'general'
   */
  _mapClauseToVector(clause) {
    const text = (
      this._safeString(clause.category) + " " +
      this._safeString(clause.title) + " " +
      this._safeString(clause.originalText)
    ).toLowerCase();

    // 1. Intellectual Property
    if (/intellectual property|invention|patent|copyright|trademark|trade secret|proprietary|work for hire|background technology|open source|pre-existing|model training|ai training|data license/i.test(text)) {
      return "ip";
    }

    // 2. Financial Terms & Penalties
    if (/financial|payment|fee|rent|deposit|cost|expense|penalty|late fee|invoice|interest|billing|compensation|salary|tax|withhold|escalat|net 30|net 90|remit/i.test(text)) {
      return "financial";
    }

    // 3. Termination & Notice Windows
    if (/terminat|renewal|notice|cancel|vacate|surrender|cure period|expiration|term of|evergreen|at-will/i.test(text)) {
      return "termination";
    }

    // 4. Liability & Indemnification
    if (/liability|indemnif|hold harmless|damage|warranty|defend|casualty|loss|negligence|remedy|insurance|as-is|disclaim/i.test(text)) {
      return "liability";
    }

    // 5. Dispute Resolution & Governing Law
    if (/dispute|arbitrat|jurisdiction|governing law|venue|court|jury trial|class action|litigation|claim|mediation/i.test(text)) {
      return "dispute";
    }

    // Secondary heuristics for common special clauses
    if (/non-compete|compete|restraint|solicit|moonlighting|exclusiv/i.test(text)) {
      return "liability"; // Restrictive covenants expose client to restraint & liability
    }
    if (/confidential|non-disclosure|proprietary data/i.test(text)) {
      return "ip";
    }

    return "general";
  },

  // --- Core API Methods ---

  /**
   * Calculate fairness score (0 to 100) and 5-vector risk breakdown
   * Uses normalized, size-invariant weighted math calibrated to respect clean contracts.
   */
  calculateFairnessMetrics(doc) {
    if (!doc || !Array.isArray(doc.clauses) || doc.clauses.length === 0) {
      return {
        overallScore: 50,
        healthRating: "Moderate Risk",
        healthClass: "med",
        vectors: {
          liability: 75,
          ip: 75,
          financial: 75,
          termination: 75,
          dispute: 75
        },
        highRiskCount: 0,
        medRiskCount: 0,
        lowRiskCount: 0,
        totalClauses: 0,
        criticalTrapCount: 0,
        averageRisk: 30
      };
    }

    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;
    let weightedRiskSum = 0;
    let totalWeight = 0;
    let rawRiskSum = 0;

    const vectorScores = {
      liability: [],
      ip: [],
      financial: [],
      termination: [],
      dispute: []
    };

    doc.clauses.forEach(clause => {
      const score = this._getNumericRiskScore(clause);
      rawRiskSum += score;

      // Assign weight by severity
      if (score >= 75 || clause.riskLevel === "high") {
        highCount++;
        weightedRiskSum += score * 3.0;
        totalWeight += 3.0;
      } else if (score >= 50 || clause.riskLevel === "med") {
        medCount++;
        weightedRiskSum += score * 1.6;
        totalWeight += 1.6;
      } else {
        lowCount++;
        weightedRiskSum += score * 0.7;
        totalWeight += 0.7;
      }

      // Map to vector
      const vector = this._mapClauseToVector(clause);
      if (vector !== "general" && vectorScores[vector]) {
        vectorScores[vector].push(score);
      }
    });

    const totalCount = doc.clauses.length;
    const avgRisk = rawRiskSum / totalCount;
    const weightedAvgRisk = totalWeight > 0 ? (weightedRiskSum / totalWeight) : avgRisk;

    // Trap concentration penalty: high-risk clauses in short documents carry heavy weight
    const highRatio = highCount / totalCount;
    const trapPenalty = highCount === 0 ? 0 : Math.min(35, (highCount * 7.5) + (highRatio * 15));

    // Overall fairness computation:
    // Baseline risk (<= 25) incurs gentle proportional deduction (max 7 pts)
    // Excess risk (> 25) represents unbalanced liability and is deducted strongly
    const baseDeduction = Math.min(25, weightedAvgRisk) * 0.28;
    const excessDeduction = Math.max(0, weightedAvgRisk - 25) * 0.82;
    let overallFairness = 100 - (baseDeduction + excessDeduction + trapPenalty * 0.4);
    overallFairness = Math.round(Math.max(12, Math.min(96, overallFairness)));

    // Vector safety averages (0 to 100, where 100 is safest)
    const computeVectorSafety = (arr) => {
      if (arr.length === 0) {
        // If contract does not contain this vector, default to safe baseline aligned with overall fairness
        return Math.round(Math.max(88, Math.min(98, overallFairness > 70 ? 96 : 90)));
      }
      const vAvg = arr.reduce((a, b) => a + b, 0) / arr.length;
      const vMax = Math.max(...arr);
      // Combine average with worst-case clause penalty in that vector
      const compositeRisk = (vAvg * 0.6) + (vMax * 0.4);
      const riskPenalty = compositeRisk <= 25 
        ? compositeRisk * 0.25 
        : (6.25 + (compositeRisk - 25) * 0.85);
      return Math.round(Math.max(10, Math.min(98, 100 - riskPenalty)));
    };

    const vectors = {
      liability: computeVectorSafety(vectorScores.liability),
      ip: computeVectorSafety(vectorScores.ip),
      financial: computeVectorSafety(vectorScores.financial),
      termination: computeVectorSafety(vectorScores.termination),
      dispute: computeVectorSafety(vectorScores.dispute)
    };

    let healthRating = "Fair & Balanced";
    let healthClass = "high"; // green

    if (overallFairness < 50 || highCount >= 3) {
      healthRating = "Highly Unfavorable / Severe Traps";
      healthClass = "low"; // red
    } else if (overallFairness < 75 || highCount > 0 || medCount >= 2) {
      healthRating = "Proceed with Caution";
      healthClass = "med"; // yellow
    }

    return {
      overallScore: overallFairness,
      healthRating: healthRating,
      healthClass: healthClass,
      vectors: vectors,
      highRiskCount: highCount,
      medRiskCount: medCount,
      lowRiskCount: lowCount,
      totalClauses: totalCount,
      criticalTrapCount: highCount,
      averageRisk: Math.round(avgRisk)
    };
  },

  /**
   * Grounded interactive Q&A query engine with boundary-aware token matching & multi-clause cross-referencing
   */
  queryDocument(doc, question) {
    if (!doc || !Array.isArray(doc.clauses) || doc.clauses.length === 0) {
      return {
        answer: "No active document loaded to search. Please select or upload a contract.",
        citations: []
      };
    }

    const qRaw = this._safeString(question);
    if (!qRaw) {
      return {
        answer: "Please ask a specific question regarding this agreement (e.g., late fees, unannounced entry, or side project ownership).",
        citations: []
      };
    }

    const qClean = this._cleanPunctuation(qRaw.toLowerCase());
    const qLower = qRaw.toLowerCase();

    // Extract significant search tokens
    const rawTokens = qClean.split(/\s+/).filter(Boolean);
    const keywords = rawTokens.filter(w => {
      if (this._shortKeywords.has(w)) return true;
      if (w.length >= 3 && !this._stopWords.has(w)) return true;
      return false;
    });

    const rankedClauses = [];

    doc.clauses.forEach(clause => {
      let matchScore = 0;
      const titleLower = this._safeString(clause.title).toLowerCase();
      const numLower = this._safeString(clause.number).toLowerCase();
      const catLower = this._safeString(clause.category).toLowerCase();
      const bodyLower = this._safeString(clause.originalText).toLowerCase();
      const explanationLower = this._getClauseExplanation(clause, "standard").toLowerCase();
      const insightLower = this._safeString(clause.actionInsight).toLowerCase();

      const combinedText = `${numLower} ${titleLower} ${catLower} ${bodyLower} ${explanationLower} ${insightLower}`;

      // 1. Direct Keyword Matching with boundary-aware field weighting
      keywords.forEach(word => {
        // Exact word boundary matching for high precision
        const wordRegex = new RegExp(`\\b${word}\\b`, "i");
        const titleMatch = wordRegex.test(titleLower);
        const catMatch = wordRegex.test(catLower);
        const bodyMatch = wordRegex.test(bodyLower);
        const expMatch = wordRegex.test(explanationLower);

        if (titleMatch) matchScore += 30;
        if (catMatch) matchScore += 18;
        if (bodyMatch) matchScore += 12;
        if (expMatch) matchScore += 14;

        // Substring fallback for partial stems (only for longer words >= 4 letters)
        if (!titleMatch && !bodyMatch && word.length >= 4 && combinedText.includes(word)) {
          matchScore += 8;
        }

        // Plural / singular stemming match (using boundary-safe check)
        if (word.length >= 4) {
          if (word.endsWith("s")) {
            const singular = word.slice(0, -1);
            if (new RegExp(`\\b${singular}\\b`, "i").test(combinedText)) matchScore += 6;
          } else {
            const plural = word + "s";
            if (new RegExp(`\\b${plural}\\b`, "i").test(combinedText)) matchScore += 6;
          }
        }
      });

      // 2. High-Confidence Phrase Matching
      const keyPhrases = [
        "late fee", "late fees", "security deposit", "side project", "side projects",
        "open source", "prior invention", "work for hire", "quiet enjoyment", "move out",
        "written notice", "unannounced entry", "as is", "model training", "class action",
        "at will", "non compete", "non-compete", "hold harmless", "air condition",
        "liquidated damages", "grace period", "water heater", "cure period"
      ];
      keyPhrases.forEach(phrase => {
        if (qLower.includes(phrase) && combinedText.includes(phrase)) {
          matchScore += 45;
        }
      });

      // 3. Domain-Specific Semantic Intent Boosting (Using word boundaries to avoid substring false positives)
      // Tenancy & Entry
      if (/\b(landlord|enter|unannounced|privacy|key|keys|lock|inspect|showing)\b/i.test(qLower) && 
          /\b(entry|premises|inspect|quiet enjoyment|access)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // Repairs & Maintenance
      if (/\b(ac|hvac|roof|repair|broken|fix|maintenance|heater|plumbing|leak|mold|habitab\w*)\b/i.test(qLower) && 
          /\b(maintenance|plumbing|hvac|repair|structural|condition)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // Late Fees & Financial Penalties
      if (/\b(late|fee|fees|penalty|due date|grace period|compound)\b/i.test(qLower) && 
          /\b(late fee|penalty|first day|calendar month|disbursement)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // Move out & Auto-Renewal
      if (/\b(move out|notice|renew|leave|vacate|opt out|term of)\b/i.test(qLower) && 
          /\b(renew|vacate|notice|expiration|term|evergreen)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // Security Deposit & Refunds
      if (/\b(deposit|security|money back|refund|deduct|retain)\b/i.test(qLower) && 
          /\b(deposit|liquidated damages|itemiz\w*|withhold)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // Side Projects & IP Ownership
      if (/\b(side project|side projects|weekend|hobby|inventions|own code|github|personal)\b/i.test(qLower) && 
          /\b(invention|pre-existing|patent|intellectual|copyright|work for hire)\b/i.test(combinedText)) {
        matchScore += 45;
      }
      // Non-Compete & Exclusivity
      if (/\b(non-compete|competitor|work for|hire|freelance|other client|moonlighting)\b/i.test(qLower) && 
          /\b(non-compete|compete|restraint|exclusiv\w*|solicit)\b/i.test(combinedText)) {
        matchScore += 45;
      }
      // Payment Terms & Invoicing
      if (/\b(pay|payment|net 30|net 90|remit|overdue|late payment)\b/i.test(qLower) && 
          /\b(payment|invoice|remit|net|interest)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // AI & Data Rights
      if (/\b(ai|model training|train|data license|data privacy|upload)\b/i.test(qLower) && 
          /\b(machine learning|artificial intelligence|train|license|proprietary documents)\b/i.test(combinedText)) {
        matchScore += 45;
      }
      // Court, Lawsuit & Arbitration
      if (/\b(sue|arbitrat\w*|court|lawsuit|judge|jury|class action)\b/i.test(qLower) && 
          /\b(arbitrat\w*|jury|dispute|venue|governing law)\b/i.test(combinedText)) {
        matchScore += 40;
      }
      // At-Will & Severance
      if (/\b(severance|layoff|laid off|fire|fired|at-will|terminate)\b/i.test(qLower) && 
          /\b(at-will|severance|without cause|termination)\b/i.test(combinedText)) {
        matchScore += 40;
      }

      if (matchScore > 0) {
        rankedClauses.push({ clause, score: matchScore });
      }
    });

    rankedClauses.sort((a, b) => b.score - a.score);

    // Confidence threshold: if no significant matches were found
    if (rankedClauses.length === 0 || rankedClauses[0].score < 14) {
      return {
        answer: `I reviewed **${doc.title}**, but could not locate a specific clause addressing: "${qRaw}".\n\nContracts frequently omit protections through silence. If this right or condition is vital to you, consider requesting an express written amendment before executing the agreement.`,
        citations: []
      };
    }

    const topMatch = rankedClauses[0].clause;
    const secondaryMatches = rankedClauses
      .slice(1, 4)
      .filter(m => m.score >= 25 && m.score >= rankedClauses[0].score * 0.35)
      .map(m => m.clause);

    const explanation = this._getClauseExplanation(topMatch, "standard");
    const insight = this._getClauseInsight(topMatch);

    let answerText = `### 📌 Primary Governing Clause: **${topMatch.number}: ${topMatch.title}**\n\n`;
    answerText += `${explanation}\n\n`;

    if (topMatch.riskLevel === "high") {
      answerText += `🚨 **Critical Risk Warning**: This provision is flagged as **high risk**. ${insight}\n\n`;
    } else if (topMatch.riskLevel === "med") {
      answerText += `⚠️ **Cautionary Advisory**: ${insight}\n\n`;
    } else {
      answerText += `✅ **Standard Term**: ${insight}\n\n`;
    }

    // Excerpt with clean truncation
    const verbatimSnippet = this._truncate(topMatch.originalText, 220);
    answerText += `> *" ${verbatimSnippet} "*\n\n`;

    // Multi-clause cross-reference synthesis if relevant clauses exist
    if (secondaryMatches.length > 0) {
      answerText += `#### 🔗 Also Relevant to Your Question:\n`;
      secondaryMatches.forEach(sec => {
        const secExplanation = this._getClauseExplanation(sec, "standard");
        answerText += `- **${sec.number} (${sec.title})**: ${this._truncate(secExplanation, 140)}\n`;
      });
      answerText += `\n`;
    }

    answerText += `*Educational assistance grounded in document clauses. Consult qualified counsel for formal legal representation.*`;

    const citations = [
      { id: topMatch.id, number: topMatch.number, title: topMatch.title },
      ...secondaryMatches.map(c => ({ id: c.id, number: c.number, title: c.title }))
    ];

    return {
      answer: answerText,
      citations: citations
    };
  },

  /**
   * Generate Attorney Consultation Brief (1-page lawyer prep document)
   */
  generateAttorneyBrief(doc) {
    if (!doc || !Array.isArray(doc.clauses)) {
      return "# Legal Consultation Brief\n\nNo active contract loaded for briefing generation.";
    }

    const title = this._safeString(doc.title, "Untitled Legal Agreement");
    const category = this._safeString(doc.category, "Commercial Agreement");
    const parties = this._safeString(doc.parties, "Undisclosed Parties");
    const effectiveDate = this._safeString(doc.effectiveDate, "Unspecified");

    const metrics = this.calculateFairnessMetrics(doc);
    const redFlags = doc.clauses.filter(c => c.riskLevel === "high" || this._getNumericRiskScore(c) >= 75);
    const cautions = doc.clauses.filter(c => (c.riskLevel === "med" || this._getNumericRiskScore(c) >= 50) && !redFlags.includes(c));

    const todayFormatted = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    // Dynamic strategic question generator based on clause domain
    const getAttorneyQuestion = (clause) => {
      const text = (clause.title + " " + clause.originalText).toLowerCase();
      if (/intellectual property|invention|patent|work for hire|pre-existing/i.test(text)) {
        return "Can we demand a Schedule of Prior Inventions and a statutory Labor Code carve-out protecting independent, off-hours creations?";
      }
      if (/indemnif|liability|hold harmless|damage|unlimited/i.test(text)) {
        return "Can we introduce a mutual aggregate liability cap tied to fees paid and strike indirect or consequential damages?";
      }
      if (/non-compete|restraint|solicit|moonlighting/i.test(text)) {
        return "Is this post-contract restrictive covenant void or unenforceable under applicable state laws and FTC rulings?";
      }
      if (/late fee|penalty|compound|liquidated/i.test(text)) {
        return "Does this punitive fee schedule violate local statutory caps on liquidated damages?";
      }
      if (/enter|unannounced|privacy|premises/i.test(text)) {
        return "Can we mandate at least 24 hours written notice for entry during business hours, striking unrestricted access?";
      }
      if (/arbitrat|jury trial|class action|venue/i.test(text)) {
        return "Should we carve out equitable IP relief and require the drafting party to bear all arbitration administration fees?";
      }
      if (/net 90|payment|withhold/i.test(text)) {
        return "Can we modify this to standard Net 30 with late payment interest and objective deliverable acceptance criteria?";
      }
      return "What standard commercial fallback language should we propose to restore mutual risk allocation?";
    };

    return `# Legal Consultation Brief: Pre-Execution Review & Strategic Inquiries

**Contract Title**: ${title}  
**Category**: ${category}  
**Contracting Parties**: ${parties}  
**Assessment Date**: ${todayFormatted}  
**Overall Fairness Index**: ${metrics.overallScore}/100 (${metrics.healthRating})  
**Risk Vector Breakdown**: Liability: ${metrics.vectors.liability}% | IP: ${metrics.vectors.ip}% | Financial: ${metrics.vectors.financial}% | Termination: ${metrics.vectors.termination}% | Dispute: ${metrics.vectors.dispute}%

---

### 1. Executive Summary for Counsel
Client is seeking formal legal counsel prior to executing this agreement. AI diagnostic screening identified **${redFlags.length} critical high-risk clauses** and **${cautions.length} cautionary ambiguities**. 
${redFlags.length > 0 
  ? `Primary legal concerns center around disproportionate liability exposure, overbroad intellectual property transfers, or surrender of statutory consumer/tenant protections.`
  : `The draft generally adheres to commercial baseline standards, with few aggressive unilateral stipulations.`
}

### 2. High-Priority Red Flag Clauses & Strategic Questions for Attorney
${redFlags.length === 0 
  ? `*No high-severity red flags detected in this agreement draft. All analyzed provisions fall within standard commercial risk parameters.*`
  : redFlags.map((c, i) => {
    const verbatim = this._truncate(c.originalText, 240);
    const explanation = this._getClauseExplanation(c, "legal") || this._getClauseExplanation(c, "standard");
    const insight = this._getClauseInsight(c);
    const question = getAttorneyQuestion(c);

    return `
#### Issue ${i + 1}: ${c.title} (${c.number})
- **Verbatim Language**:
  > "${verbatim}"
- **Identified Concern**: ${explanation}
- **Recommended Action**: ${insight}
- **Strategic Question for Counsel**: *" ${question} "*
`;
  }).join("\n")}

### 3. Cautionary Provisions to Clarify
${cautions.length === 0 
  ? `*No secondary cautionary terms flagged.*` 
  : cautions.map(c => `- **${c.number} (${c.title})**: ${this._getClauseExplanation(c, "standard")}`).join("\n")}

### 4. Client Objectives for Legal Consultation
1. Validate enforceability and legal validity of highlighted terms in the governing jurisdiction.
2. Formulate prioritized redline proposals for counterparty review.
3. Ensure appropriate reciprocal safeguards for intellectual property, payment security, and termination notice windows.

---
*Notice: This brief was generated by LexiPulse AI as an educational organizational tool for consultation preparation. It does not constitute formal legal counsel.*`;
  },

  /**
   * Generate Counter-Proposal Negotiation Email
   * Formulates professional, articulate redline language and business rationales.
   */
  generateNegotiationCounter(doc) {
    if (!doc || !Array.isArray(doc.clauses)) {
      return "Subject: Proposed Contract Revisions\n\nNo active contract loaded.";
    }

    const title = this._safeString(doc.title, "Agreement");
    const redFlags = doc.clauses.filter(c => c.riskLevel === "high" || c.riskLevel === "med");

    // Dynamic constructive redline suggestion generator
    const getCounterLanguage = (clause) => {
      const text = (clause.title + " " + clause.originalText).toLowerCase();
      if (/intellectual property|invention|work for hire|patent|pre-existing/i.test(text)) {
        return "Clarify that Contractor grants Client ownership exclusively in final, paid Deliverables created under this Agreement, while Contractor explicitly retains all ownership of Pre-Existing Materials, reusable toolkits, and open-source components.";
      }
      if (/indemnif|liability|hold harmless|damage/i.test(text)) {
        return "Establish mutual indemnification capped at total fees paid under this Agreement, and mutually exclude indirect, special, or consequential damages.";
      }
      if (/net 90|payment terms/i.test(text)) {
        return "Adjust payment timeline to standard Net 30 from invoice receipt, with a standard 1.5% monthly interest on overdue undisputed balances.";
      }
      if (/late fee|penalty/i.test(text)) {
        return "Provide a standard 5-business-day grace period, capping late charges at 5% of the overdue monthly amount.";
      }
      if (/non-compete|compete|restraint/i.test(text)) {
        return "Delete the post-termination non-compete covenant in its entirety, substituting a standard and reasonable non-solicitation of direct clients during the active term.";
      }
      if (/enter|unannounced|privacy/i.test(text)) {
        return "Require minimum 24-hour advance written notice for non-emergency entry, scheduled exclusively during normal business hours.";
      }
      if (/model training|ai training|data license/i.test(text)) {
        return "Include an express exclusion prohibiting the use or ingestion of customer proprietary data, documents, or code for machine learning or AI model training.";
      }
      if (/terminat.*convenience|immediate terminat/i.test(text)) {
        return "Make termination for convenience mutual on 30 days written notice, guaranteeing compensation for all authorized work performed through the effective termination date.";
      }

      // Fallback: clean action insight
      const raw = this._getClauseInsight(clause).replace(/^[🚨⚠️✅]\s*/, "");
      return raw.startsWith("Negotiate") || raw.startsWith("Propose") || raw.startsWith("Require") || raw.startsWith("Ensure")
        ? raw
        : `Revise to provide mutual protection: ${raw}`;
    };

    // Specific business rationales
    const getBusinessRationale = (clause) => {
      const text = (clause.title + " " + clause.originalText).toLowerCase();
      if (/intellectual property|invention/i.test(text)) {
        return "Ensures Client secures full title to contracted deliverables while protecting independent pre-existing toolkits from unintended assignment.";
      }
      if (/indemnif|liability/i.test(text)) {
        return "Aligns risk exposure with contract value and reflects standard commercial risk allocations.";
      }
      if (/payment|net 90|fee/i.test(text)) {
        return "Maintains predictable operational cash flow and conforms to standard 30-day commercial disbursement practices.";
      }
      if (/non-compete|moonlighting/i.test(text)) {
        return "Complies with prevailing statutory public policy regarding professional practice and mobility while preserving appropriate non-solicitation protections.";
      }
      if (/enter|privacy/i.test(text)) {
        return "Upholds statutory rights to quiet enjoyment and reasonable privacy while maintaining necessary maintenance access.";
      }
      return "To establish mutual fairness and standard commercial allocation of operational risk.";
    };

    if (redFlags.length === 0) {
      return `Subject: Confirmation & Execution Draft - ${title}

Dear [Counterparty Name / Legal Team],

Thank you for providing the draft of the ${title}. 

I have reviewed the agreement in detail. The terms appear well-structured, balanced, and commercially standard. I am prepared to move forward with execution.

To finalize our records, could you please confirm:
1. The formal counterparty entity name and designated notice addresses.
2. The intended effective commencement date.
3. Whether you prefer execution via electronic signature (e.g., DocuSign).

I look forward to our successful collaboration.

Best regards,

[Your Name]  
[Your Title / Contact Information]`;
    }

    return `Subject: Proposed Revisions & Clarifications - ${title}

Dear [Counterparty Name / Legal Team],

Thank you for providing the draft of the ${title}. I am excited about the opportunity to partner together and move this agreement forward.

I have completed an initial review of the terms. Overall the contract provides a clear framework for our engagement. However, to ensure a balanced, sustainable working relationship that aligns with standard industry practices, there are a few specific provisions I would appreciate your team's flexibility in adjusting:

${redFlags.map((c, idx) => {
  const snippet = this._truncate(c.originalText, 120);
  const adjustment = getCounterLanguage(c);
  const rationale = getBusinessRationale(c);

  return `${idx + 1}. Regarding ${c.number} (${c.title}):
   - Current Language: "${snippet}"
   - Proposed Adjustment: ${adjustment}
   - Business Rationale: ${rationale}
`;
}).join("\n")}
I have drafted specific redline suggestions for these sections to expedite your review and ensure minimal friction. I am confident we can quickly align on these standard commercial points.

Please let me know if you are available for a brief call to finalize these details, or if you would prefer me to send over the updated redline markup directly.

Thank you again for your collaboration, and I look forward to working together.

Best regards,

[Your Name]  
[Your Title / Contact Information]`;
  },

  /**
   * Generate Obligations & Deadlines Checklist
   * Generates distinct, contextual tasks with unique keys to avoid UI state collisions.
   */
  generateObligationsChecklist(doc) {
    if (!doc || !Array.isArray(doc.clauses) || doc.clauses.length === 0) {
      return [
        {
          id: "ob-exec-copy",
          task: "Retain fully executed counterpart copy signed by all parties",
          detail: "Store in secure cloud storage alongside date-stamped execution receipts.",
          category: "General",
          priority: "High"
        },
        {
          id: "ob-effective-date",
          task: "Record formal effective date and term expiration",
          detail: "Verify contract commencement date in project management tracker.",
          category: "Deadlines",
          priority: "Medium"
        }
      ];
    }

    const items = [];
    const docCategory = this._safeString(doc.category).toLowerCase();
    const isRealEstate = /lease|tenant|landlord|real estate/i.test(docCategory);
    const isSoftware = /software|developer|consult|freelance|engineer|technology/i.test(docCategory);

    doc.clauses.forEach((c, idx) => {
      const text = (c.originalText + " " + c.title + " " + c.category).toLowerCase();
      const numLabel = c.number || `Clause ${idx + 1}`;

      // 1. Payment & Invoicing Obligations
      if (/rent|payment|invoice|remit|disbursement|deposit/i.test(text)) {
        items.push({
          id: `ob-${c.id || idx}-pay`,
          task: `Verify payment schedule and maintain payment receipts (${numLabel})`,
          detail: `${c.title}: Schedule calendar reminders for remittance deadlines, accounting invoices, and wire confirmation records.`,
          category: "Financial",
          priority: "High"
        });
      }

      // 2. Deadlines, Notice Periods & Renewal Windows
      if (/notice|vacate|renew|terminat|cure period|expiration/i.test(text)) {
        items.push({
          id: `ob-${c.id || idx}-deadline`,
          task: `Set calendar alert for formal advance notice window under ${numLabel}`,
          detail: `${c.title}: Calculate mandatory advance notice window (certified mail / written portal) before auto-renewal or penalty triggers.`,
          category: "Deadlines",
          priority: "High"
        });
      }

      // 3. Inspections, Maintenance & Condition Audits
      if (/maintenance|repair|care|inspection|premises|deliverable acceptance/i.test(text)) {
        const detailText = isRealEstate 
          ? "Conduct move-in condition walk-through with date-stamped photographs of all fixtures and existing wear."
          : isSoftware 
          ? "Document initial repository baseline, third-party dependencies, and formal milestone delivery criteria."
          : "Conduct pre-commencement audit and retain written condition baseline verification.";

        items.push({
          id: `ob-${c.id || idx}-audit`,
          task: `Conduct condition and acceptance baseline audit (${numLabel})`,
          detail: `${c.title}: ${detailText}`,
          category: "Compliance",
          priority: "Medium"
        });
      }

      // 4. Confidentiality & Data Protection
      if (/confidential|proprietary|non-disclosure|trade secret/i.test(text)) {
        items.push({
          id: `ob-${c.id || idx}-conf`,
          task: `Implement strict confidentiality safeguards for protected materials (${numLabel})`,
          detail: `${c.title}: Label proprietary documents, restrict disclosure to need-to-know personnel, and prepare return/destruction protocols.`,
          category: "Confidentiality",
          priority: "Medium"
        });
      }

      // 5. Intellectual Property & Invention Carve-Outs
      if (/intellectual property|invention|patent|work for hire|background technology/i.test(text)) {
        items.push({
          id: `ob-${c.id || idx}-ip`,
          task: `Compile written Schedule of Prior Inventions and Background IP (${numLabel})`,
          detail: `${c.title}: Document all pre-existing code libraries, toolkits, and independent projects in writing prior to signing.`,
          category: "Intellectual Property",
          priority: "High"
        });
      }

      // 6. Restrictive Covenants & Non-Solicit Tracking
      if (/non-compete|solicit|exclusiv|moonlighting/i.test(text)) {
        items.push({
          id: `ob-${c.id || idx}-covenant`,
          task: `Map boundary restrictions for outside activities and clients (${numLabel})`,
          detail: `${c.title}: Note exact duration, geographic scope, and restricted customer categories to avoid breach of covenant.`,
          category: "Compliance",
          priority: "Medium"
        });
      }

      // 7. Insurance & Indemnification Compliance
      if (/insurance|certificate of insurance|indemnif.*coverage/i.test(text)) {
        items.push({
          id: `ob-${c.id || idx}-ins`,
          task: `Secure required Certificate of Insurance (COI) endorsements (${numLabel})`,
          detail: `${c.title}: Verify commercial general liability or professional E&O coverage limits and list counterparty as additional insured if required.`,
          category: "Compliance",
          priority: "Medium"
        });
      }
    });

    // Fallback baseline if no specific triggers matched
    if (items.length === 0) {
      items.push(
        {
          id: "ob-general-counterpart",
          task: "Retain fully executed counterpart signed by authorized representatives",
          detail: "Secure in permanent encrypted cloud storage.",
          category: "General",
          priority: "High"
        },
        {
          id: "ob-general-dates",
          task: "Calendar effective date, renewal milestones, and notice deadlines",
          detail: `Commencement date noted: ${this._safeString(doc.effectiveDate, "Upon signature")}.`,
          category: "Deadlines",
          priority: "Medium"
        }
      );
    }

    return items;
  },

  /**
   * Detect specific predatory legal anti-patterns
   */
  detectPredatoryPatterns(doc) {
    if (!doc || !Array.isArray(doc.clauses)) return [];

    const patterns = [];

    doc.clauses.forEach(c => {
      const text = (c.originalText + " " + c.title).toLowerCase();

      if (/sole discretion|unilateral.*discretion|sole subjective/i.test(text)) {
        patterns.push({
          clause: c.number,
          title: c.title,
          pattern: "Unilateral Subjective Discretion",
          severity: "high",
          description: "Grants counterparty the right to make arbitrary determinations without objective commercial standards."
        });
      }
      if (/indemnif.*unlimited|indirect or consequential|attorneys'? fees.*unlimited/i.test(text)) {
        patterns.push({
          clause: c.number,
          title: c.title,
          pattern: "Uncapped Consequential Indemnification",
          severity: "high",
          description: "Exposes client to bankrupting third-party liabilities and open-ended legal fees."
        });
      }
      if (/enter.*without notice|unannounced|any hour of the day or night/i.test(text)) {
        patterns.push({
          clause: c.number,
          title: c.title,
          pattern: "Surrender of Quiet Enjoyment / 24-7 Entry",
          severity: "high",
          description: "Strikes fundamental statutory privacy and notice rights for property access."
        });
      }
      if (/train.*model|artificial intelligence.*license|perpetual.*worldwide.*royalty-free.*license.*data/i.test(text)) {
        patterns.push({
          clause: c.number,
          title: c.title,
          pattern: "Surrender of Proprietary Data for AI Training",
          severity: "high",
          description: "Grants vendor broad perpetual rights to ingest confidential documents into commercial models."
        });
      }
      if (/worldwide.*non-compete|twenty-four.*months.*not.*compete/i.test(text)) {
        patterns.push({
          clause: c.number,
          title: c.title,
          pattern: "Extraterritorial Restraint of Trade",
          severity: "high",
          description: "Suppresses livelihood with an unreasonably broad global non-compete covenant."
        });
      }
      if (/immediate late fee.*twenty-five percent|penalty of \$50 per day/i.test(text)) {
        patterns.push({
          clause: c.number,
          title: c.title,
          pattern: "Punitive Compounding Liquidated Damages",
          severity: "high",
          description: "Imposes punitive penalties exceeding statutory late-fee legal caps."
        });
      }
    });

    return patterns;
  },

  /**
   * Generate concise Plain-English Executive Summary
   */
  generatePlainEnglishExecutiveSummary(doc) {
    if (!doc || !Array.isArray(doc.clauses)) {
      return "No document loaded to summarize.";
    }

    const metrics = this.calculateFairnessMetrics(doc);
    const patterns = this.detectPredatoryPatterns(doc);

    return `This agreement (${doc.title}) scored **${metrics.overallScore}/100** (${metrics.healthRating}). ` +
      `It contains ${doc.clauses.length} total clauses with **${metrics.highRiskCount} high-risk provisions** and **${metrics.medRiskCount} cautionary items**. ` +
      (patterns.length > 0 
        ? `Key traps detected include: ${patterns.map(p => p.pattern).join(", ")}. Prioritize negotiating these points before signing.` 
        : `Terms conform to standard commercial balances with no severe predatory traps.`);
  }
};

// Global browser window export & Node.js module export support
if (typeof window !== "undefined") {
  window.LegalEngine = LegalEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = LegalEngine;
}
