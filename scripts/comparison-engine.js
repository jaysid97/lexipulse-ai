/**
 * LexiPulse AI - Contract Comparison & Redline Shift Engine
 * Performs semantic diffing and identifies strategic legal alterations between drafts.
 */

const ComparisonEngine = {
  /**
   * Compare two documents or use pre-configured comparison data
   */
  compareDocuments(docA, docB) {
    // If docA already has a rich comparison package configured (e.g. freelance contract)
    if (docA && docA.comparisonVersion) {
      return docA.comparisonVersion;
    }

    if (!docA || !docB) {
      return {
        v1Title: docA ? docA.title : "Document 1",
        v2Title: docB ? docB.title : "Document 2",
        comparisonSummary: "Select or upload two versions of a contract to compare changes.",
        shifts: []
      };
    }

    const shifts = [];
    const clausesA = docA.clauses || [];
    const clausesB = docB.clauses || [];

    // Map by similarity of title/number
    clausesB.forEach(cB => {
      const matchA = clausesA.find(cA => 
        cA.number.toLowerCase() === cB.number.toLowerCase() || 
        cA.title.toLowerCase() === cB.title.toLowerCase()
      );

      if (!matchA) {
        shifts.push({
          clause: `${cB.number} - ${cB.title}`,
          status: "added",
          impact: cB.riskLevel === "high" ? "high" : "med",
          v1Text: "[Not present in Document 1]",
          v2Text: cB.originalText,
          aiAnalysis: `New clause introduced in second draft. Classified risk level: ${cB.riskLevel.toUpperCase()}.`
        });
      } else {
        // Compare text
        if (matchA.originalText.trim() !== cB.originalText.trim()) {
          const diffAnalysis = this.analyzeTextShift(matchA.originalText, cB.originalText);
          shifts.push({
            clause: `${cB.number} - ${cB.title}`,
            status: "modified",
            impact: diffAnalysis.impact,
            v1Text: matchA.originalText,
            v2Text: cB.originalText,
            aiAnalysis: diffAnalysis.reason
          });
        }
      }
    });

    // Check for removed clauses in A that aren't in B
    clausesA.forEach(cA => {
      const matchB = clausesB.find(cB => 
        cB.number.toLowerCase() === cA.number.toLowerCase() || 
        cB.title.toLowerCase() === cA.title.toLowerCase()
      );
      if (!matchB) {
        shifts.push({
          clause: `${cA.number} - ${cA.title}`,
          status: "removed",
          impact: "high",
          v1Text: cA.originalText,
          v2Text: "[Deleted in Document 2]",
          aiAnalysis: `Clause completely removed in second draft. Verify if vital protections were deleted.`
        });
      }
    });

    return {
      v1Title: docA.title,
      v2Title: docB.title,
      comparisonSummary: `Detected ${shifts.length} key variations between the two versions.`,
      shifts: shifts
    };
  },

  /**
   * Analyze the legal shift between two text snippets
   */
  analyzeTextShift(text1, text2) {
    let impact = "med";
    let reason = "Text modified between drafts.";

    const t1Lower = text1.toLowerCase();
    const t2Lower = text2.toLowerCase();

    if (t1Lower.includes("cap") && !t2Lower.includes("cap")) {
      impact = "high";
      reason = "Liability limitation appears to have been removed or diluted.";
    } else if (t1Lower.includes("net 30") && t2Lower.includes("net 90")) {
      impact = "high";
      reason = "Payment timeline extended by 60 additional days.";
    } else if (!t1Lower.includes("non-compete") && t2Lower.includes("non-compete")) {
      impact = "high";
      reason = "Restrictive non-compete covenant introduced.";
    } else if (t2Lower.includes("sole discretion") && !t1Lower.includes("sole discretion")) {
      impact = "high";
      reason = "Unilateral subjective discretion granted to counterparty.";
    }

    return { impact, reason };
  }
};
