/**
 * LexiPulse AI - Sample Legal Contracts Library
 * High-fidelity, real-world agreements with rich clause breakdowns and risk profiles.
 */

const SAMPLE_DOCUMENTS = {
  "lease-agreement": {
    id: "lease-agreement",
    title: "Residential Lease Agreement (High-Risk Draft)",
    category: "Real Estate & Tenancy",
    parties: "Landlord: Apex Properties LLC | Tenant: Individual Renter",
    effectiveDate: "October 1, 2026",
    summary: "A standard-looking residential apartment lease containing several highly aggressive landlord-favorable traps including unannounced entry, tenant liability for foundation/HVAC systems, and automatic rent increases.",
    clauses: [
      {
        id: "lease-c1",
        number: "Section 2.1",
        title: "Rent Payment & Extreme Late Fees",
        category: "Financial Obligations",
        riskLevel: "high",
        riskScore: 88,
        originalText: "Rent shall be due on the first (1st) day of each calendar month. If Rent is not received by 11:59 PM on the second (2nd) day of the month, Tenant shall pay an immediate late fee equal to twenty-five percent (25%) of the total monthly rent, plus an additional penalty of $50 per day until paid in full.",
        plainEnglish: {
          easy: "If your rent is just one day late, you get hit with a giant 25% fine right away, plus $50 every single day after that.",
          standard: "A severe penalty kicks in on day 2. A 25% immediate late fee plus $50/day compound penalty is often legally unenforceable in many jurisdictions that cap late fees at 5%.",
          legal: "Imposes a punitive 25% liquidated damages surcharge after a 1-day grace period, compounding daily. Violates statutory late-fee caps in most states."
        },
        actionInsight: "🚨 Negotiate a standard 5-day grace period and cap the late fee at 5% of monthly rent."
      },
      {
        id: "lease-c2",
        number: "Section 5.3",
        title: "Landlord Right of Unrestricted Entry",
        category: "Privacy & Access",
        riskLevel: "high",
        riskScore: 92,
        originalText: "Landlord, its agents, contractors, and prospective buyers or mortgagees may enter the Premises at any hour of the day or night without prior verbal or written notice to Tenant, for any reason deemed reasonable by Landlord, including inspection, repair, or showing.",
        plainEnglish: {
          easy: "The landlord or their workers can walk into your home at any time, day or night, without warning you first.",
          standard: "Eliminates your fundamental right to privacy and quiet enjoyment. Landlord claims 24/7 unannounced entry without notice.",
          legal: "Direct violation of the Covenant of Quiet Enjoyment and statutory 24–48 hour written notice requirements in most tenancy laws."
        },
        actionInsight: "🚨 Strike this clause immediately. Require minimum 24-hour written notice for non-emergencies during normal business hours only."
      },
      {
        id: "lease-c3",
        number: "Section 7.2",
        title: "Maintenance & Structural Systems Liability",
        category: "Liability & Indemnification",
        riskLevel: "high",
        riskScore: 85,
        originalText: "Tenant explicitly covenants and agrees to assume sole and full financial responsibility for all maintenance, repairs, servicing, and replacement of all plumbing, HVAC air conditioning units, electrical wiring, appliances, and structural roof or foundation elements, regardless of whether caused by normal wear and tear.",
        plainEnglish: {
          easy: "If the air conditioner breaks, the roof leaks, or old pipes burst from aging, you have to pay thousands of dollars to fix them, not the landlord.",
          standard: "Unfairly shifts major capital expenditures and structural maintenance—normally the landlord's legal duty—entirely onto the tenant.",
          legal: "Breaches the implied warranty of habitability. Tenants cannot legally be compelled to bear replacement costs for structural HVAC and roofing systems caused by ordinary wear."
        },
        actionInsight: "🚨 Demand removal. Landlord must remain responsible for all structural, plumbing, and major appliance repairs not caused by tenant negligence."
      },
      {
        id: "lease-c4",
        number: "Section 9.4",
        title: "Automatic Renewal & Escalation Clause",
        category: "Termination & Renewal",
        riskLevel: "med",
        riskScore: 68,
        originalText: "Upon expiration of the initial twelve (12) month term, this Agreement shall automatically renew for a successive twelve (12) month period unless Tenant delivers written certified notice of intent to vacate at least ninety (90) days prior. Rent during any renewed term shall automatically increase by twenty percent (20%).",
        plainEnglish: {
          easy: "You must tell them 3 full months in advance if you want to move out. If you miss that window, you are locked in for another year at a 20% higher rent.",
          standard: "Requires a 90-day advance notice (unusually long for renters) and triggers an automatic 1-year lock-in with a 20% rent hike.",
          legal: "Enforces an evergreen auto-renewal with a 90-day opt-out deadline and a unilateral 20% rent escalator, avoiding month-to-month transition."
        },
        actionInsight: "⚠️ Propose standard 30-day or 60-day notice, and cap annual rent escalation at CPI or maximum 3-5%."
      },
      {
        id: "lease-c5",
        number: "Section 12.1",
        title: "Security Deposit Forfeiture & Discretion",
        category: "Financial Obligations",
        riskLevel: "med",
        riskScore: 72,
        originalText: "The Security Deposit ($3,000) shall be held by Landlord. In the event Tenant commits any breach of any rule, including minor noise or unapproved pet visits, Landlord reserves the unilateral discretion to retain the entirety of said deposit as non-refundable liquidated damages without itemization.",
        plainEnglish: {
          easy: "If you break any small rule, the landlord can keep your entire $3,000 deposit and doesn't even have to prove what it cost them.",
          standard: "Allows the landlord to confiscate the entire deposit for trivial violations without providing an itemized accounting of actual damages.",
          legal: "Invalid penalty clause. Security deposits are trust funds held against actual demonstrable damage beyond reasonable wear and tear."
        },
        actionInsight: "⚠️ Insist on deposit return within 14-30 days post-move-out with mandatory itemized receipts for any deductions."
      },
      {
        id: "lease-c6",
        number: "Section 14.2",
        title: "Subletting & Guest Policy",
        category: "Operational Restrictions",
        riskLevel: "low",
        riskScore: 35,
        originalText: "Tenant shall not assign, sublet, or allow any overnight guest to remain in the Premises for more than fourteen (14) consecutive days or twenty-eight (28) total days in any calendar year without Landlord's prior written consent.",
        plainEnglish: {
          easy: "Guests cannot stay for more than two weeks in a row without written permission from the landlord.",
          standard: "Standard restriction preventing unauthorized permanent occupants and short-term subletting like Airbnb.",
          legal: "Routine guest restriction covenant enforceable to protect occupancy limits and local zoning compliance."
        },
        actionInsight: "✅ Balanced and typical for modern residential leases."
      }
    ],
    suggestedQuestions: [
      "Can the landlord enter my apartment whenever they want?",
      "Who pays if the air conditioner or water heater breaks?",
      "What happens if my rent is 2 days late?",
      "How much notice do I have to give before moving out?",
      "What can the landlord deduct from my $3,000 security deposit?"
    ]
  },

  "freelance-contract": {
    id: "freelance-contract",
    title: "Freelance Software Engineering Agreement (v1 Base vs v2 Redline)",
    category: "Independent Contractor & Consulting",
    parties: "Client: GlobalTech Corp | Contractor: Alex Rivers (Dev)",
    effectiveDate: "November 15, 2026",
    summary: "Software development consulting agreement. Comparison mode allows tracking client-inserted stealth redlines including an extreme non-compete, net 90 payment, and IP overreach.",
    clauses: [
      {
        id: "free-c1",
        number: "Section 3.1",
        title: "Payment Terms & Invoicing",
        category: "Financial Obligations",
        riskLevel: "high",
        riskScore: 82,
        originalText: "Client shall remit full payment for approved invoices within ninety (90) calendar days of invoice submission ('Net 90'). Late payments shall not accrue interest. Client may withhold payment if it disputes any deliverable in its sole subjective discretion.",
        plainEnglish: {
          easy: "You have to wait 3 whole months to get paid, they don't pay late fees if they delay, and they can withhold your money if they subjectively don't like something.",
          standard: "Extremely one-sided payment structure. Net 90 forces you to act as an interest-free bank, and subjective dispute clauses enable payment delays.",
          legal: "Net 90 disbursement terms coupled with interest waivers and unilateral subjective approval rights undermine contractor cash flow."
        },
        actionInsight: "🚨 Push back to Net 15 or Net 30, with 1.5% monthly interest on overdue balances and objective milestone acceptance criteria."
      },
      {
        id: "free-c2",
        number: "Section 6.2",
        title: "Intellectual Property & Pre-Existing Works Assignment",
        category: "Intellectual Property",
        riskLevel: "high",
        riskScore: 95,
        originalText: "Contractor hereby irrevocably assigns to Client all right, title, and interest worldwide in and to all Works, discoveries, code, inventions, and concepts created, conceived, or reduced to practice by Contractor during the term of this Agreement, whether or not created during work hours or utilizing Client equipment, including all pre-existing open source or proprietary libraries incorporated therein.",
        plainEnglish: {
          easy: "The client claims ownership of everything you build while this contract is active—even on your own time, on your personal computer, or code libraries you made years ago.",
          standard: "A predatory IP grab that assigns your weekend projects, past toolkits, and future unrelated work to the client.",
          legal: "Overbroad IP assignment exceeding work-for-hire boundaries; fails to carve out Contractor Pre-Existing IP, Background Technology, or independent inventions."
        },
        actionInsight: "🚨 Critical Red Flag: Restrict assignment strictly to bespoke Deliverables paid in full. Explicitly reserve ownership of Pre-Existing Materials and open source code."
      },
      {
        id: "free-c3",
        number: "Section 8.1",
        title: "Unilateral Unlimited Indemnification",
        category: "Liability & Indemnification",
        riskLevel: "high",
        riskScore: 89,
        originalText: "Contractor shall indemnify, defend, and hold harmless Client, its officers, and affiliates from and against any and all claims, losses, liabilities, costs, and damages (including unlimited attorneys' fees and indirect or consequential losses) arising out of or related to Contractor's performance or any deliverable.",
        plainEnglish: {
          easy: "If anything goes wrong or anyone sues the client over the software, you must pay all their legal fees and any damages with no dollar limit.",
          standard: "Contractor takes on uncapped financial liability for third-party claims, consequential damages, and attorneys' fees, which could bankrupt an individual freelancer.",
          legal: "Uncapped, non-mutual indemnification covering indirect/consequential damages with no liability ceiling."
        },
        actionInsight: "🚨 Cap contractor liability strictly to total fees paid under the contract, exclude consequential damages, and make indemnification mutual."
      },
      {
        id: "free-c4",
        number: "Section 9.3",
        title: "Worldwide Restrictive Non-Compete",
        category: "Exclusivity & Restrictive Covenants",
        riskLevel: "high",
        riskScore: 96,
        originalText: "During the term of this Agreement and for a period of twenty-four (24) months following termination for any reason, Contractor shall not directly or indirectly develop software, consult for, or provide services to any business or entity operating in the technology, cloud, or digital services industries worldwide.",
        plainEnglish: {
          easy: "You cannot work as a software developer for ANY tech company anywhere in the world for 2 years after this project ends.",
          standard: "An absurdly broad non-compete that would legally prevent you from earning a living as a software engineer.",
          legal: "Overly broad covenant in restraint of trade, void against public policy in many jurisdictions (e.g., California, FTC rulings), but presents severe legal harassment risk."
        },
        actionInsight: "🚨 Strike in its entirety. Freelancers and independent contractors must never accept non-competes. A standard non-solicitation of direct clients is sufficient."
      },
      {
        id: "free-c5",
        number: "Section 11.2",
        title: "Termination for Convenience",
        category: "Termination & Notice",
        riskLevel: "med",
        riskScore: 62,
        originalText: "Client may terminate this Agreement immediately at any time with or without cause upon written notice. Contractor may only terminate this Agreement upon ninety (90) days advance written notice.",
        plainEnglish: {
          easy: "They can fire you on the spot today, but you must give them 3 months notice if you want to leave.",
          standard: "Asymmetric termination rights that leave the contractor vulnerable to sudden loss of income with no reciprocal flexibility.",
          legal: "Unilateral immediate termination right for convenience for Client, asymmetric 90-day obligation on Contractor."
        },
        actionInsight: "⚠️ Make termination mutual on 14 or 30 days written notice, with payment guaranteed for all work completed up to termination."
      }
    ],
    comparisonVersion: {
      v1Title: "Original Freelancer Proposed Draft (v1)",
      v2Title: "Client's Counter Redline (v2)",
      comparisonSummary: "The client's revised redline inserted four major legal traps: altered Net 30 to Net 90, deleted the $10,000 liability cap, added an aggressive 2-year global non-compete, and extended IP claims to personal background code.",
      shifts: [
        {
          clause: "Section 3.1 - Payment Terms",
          status: "modified",
          impact: "high",
          v1Text: "Client shall pay Contractor within thirty (30) days of receipt of invoice ('Net 30'). Overdue payments shall accrue interest at 1.5% per month.",
          v2Text: "Client shall remit full payment for approved invoices within ninety (90) calendar days of invoice submission ('Net 90'). Late payments shall not accrue interest.",
          aiAnalysis: "Payment window tripled from 30 to 90 days, and late payment interest penalty was removed, making late payments risk-free for client."
        },
        {
          clause: "Section 6.2 - Pre-Existing IP Ownership",
          status: "modified",
          impact: "high",
          v1Text: "Contractor retains all ownership of Pre-Existing Works, tools, and general reusable libraries, granting Client a non-exclusive license.",
          v2Text: "Contractor assigns all right, title, and interest in all Works, discoveries, and concepts created during term, including pre-existing libraries.",
          aiAnalysis: "Client attempted an IP land grab. Your existing code portfolio and open-source tools would be transferred to the client."
        },
        {
          clause: "Section 8.1 - Limitation of Liability",
          status: "removed",
          impact: "high",
          v1Text: "Each party's aggregate liability under this Agreement shall be capped at the total amount paid by Client to Contractor under this Agreement.",
          v2Text: "[DELETED BY CLIENT - Clause struck out entirely, leaving Contractor with uncapped unlimited indemnification]",
          aiAnalysis: "Client silently removed the mutual liability cap. You are now exposed to unlimited financial damages."
        },
        {
          clause: "Section 9.3 - Global Non-Compete",
          status: "added",
          impact: "high",
          v1Text: "[Not present in Contractor v1 Draft]",
          v2Text: "Contractor shall not directly or indirectly develop software or provide services to any technology or cloud entity worldwide for 24 months.",
          aiAnalysis: "Brand-new stealth clause inserted by client. Restricts your right to work in software development globally for 2 years."
        }
      ]
    },
    suggestedQuestions: [
      "Can I work on my own side projects while this contract is active?",
      "Who owns the pre-existing code and libraries I use in the project?",
      "Can the client sue me for more money than they paid me?",
      "What are the payment terms and do they pay late fees?",
      "Is the 2-year non-compete clause legally binding?"
    ]
  },

  "employment-agreement": {
    id: "employment-agreement",
    title: "Startup Employment & Restrictive Covenants Agreement",
    category: "Employment & Labor",
    parties: "Employer: Zenith AI Systems Inc. | Employee: Full-Time Engineer",
    effectiveDate: "January 10, 2026",
    summary: "Senior Engineering employment contract containing strict moonlighting prohibitions, broad invention assignment (even for off-hours side hobbies), and mandatory binding private arbitration.",
    clauses: [
      {
        id: "emp-c1",
        number: "Section 4.1",
        title: "Exclusive Services & Anti-Moonlighting",
        category: "Operational Restrictions",
        riskLevel: "high",
        riskScore: 84,
        originalText: "Employee agrees to devote 100% of Employee's entire business time, energy, and skill exclusively to Employer. Employee shall not, without prior written approval from the Board of Directors, engage in any other business activity, whether for profit or non-profit, including freelance consulting, advisory roles, or maintaining an open-source software project.",
        plainEnglish: {
          easy: "You cannot do any freelance work, help a non-profit, or even maintain a hobby open-source coding project on your own weekends without board approval.",
          standard: "A total ban on side activities that restricts your freedom outside working hours, even for non-competing hobbies or open-source contributions.",
          legal: "Broad exclusivity covenant restricting off-hours endeavors. In many jurisdictions, employers cannot restrict non-competing off-duty conduct."
        },
        actionInsight: "🚨 Clarify that this only restricts activities during work hours and direct competitors; exempt personal hobby projects and existing open-source work."
      },
      {
        id: "emp-c2",
        number: "Section 7.3",
        title: "Invention Assignment & Off-Hours Creations",
        category: "Intellectual Property",
        riskLevel: "high",
        riskScore: 91,
        originalText: "All inventions, patentable ideas, copyrighted works, and algorithms created or conceived by Employee during the term of employment—whether created on Company premises, using Company equipment, or created entirely at Employee's home during weekends or personal vacation time—shall immediately become the exclusive property of Company.",
        plainEnglish: {
          easy: "Any app, video game, or software you invent at home on your own computer on a Sunday belongs entirely to your employer.",
          standard: "Claims ownership of your personal creative output outside work hours, even if completely unrelated to the company's business.",
          legal: "Overreaches statutory employee invention protection limits (e.g., Cal. Labor Code § 2870, WA Rev Code § 49.44.140) which protect inventions developed on personal time without employer resources."
        },
        actionInsight: "🚨 Demand statutory invention assignment carve-out protecting inventions created on personal time without employer equipment or trade secrets."
      },
      {
        id: "emp-c3",
        number: "Section 10.2",
        title: "Mandatory Private Arbitration & Class Action Waiver",
        category: "Dispute Resolution",
        riskLevel: "med",
        riskScore: 70,
        originalText: "Any dispute, claim, or controversy arising out of or relating to this Agreement or Employee's employment shall be resolved exclusively by confidential binding individual arbitration administered by AAA. Employee hereby waives any right to a jury trial or to participate in any class, collective, or representative action.",
        plainEnglish: {
          easy: "If you have a dispute about unpaid wages or wrongful termination, you cannot go to court or join with other coworkers; you must go to a private, secret arbitrator.",
          standard: "Takes away your constitutional right to a jury trial and prevents joining collective wage or harassment lawsuits.",
          legal: "Enforceable Federal Arbitration Act (FAA) predispute arbitration covenant and collective action waiver, limiting public judicial oversight."
        },
        actionInsight: "⚠️ Be aware: All workplace disputes will be kept confidential in private arbitration rather than public court."
      },
      {
        id: "emp-c4",
        number: "Section 12.1",
        title: "At-Will Employment & Severance Discretion",
        category: "Termination & Notice",
        riskLevel: "low",
        riskScore: 30,
        originalText: "Employment with the Company is at-will. Either Employee or the Company may terminate the employment relationship at any time, with or without cause, and with or without advance notice.",
        plainEnglish: {
          easy: "Either you or the company can end your employment at any time for any legal reason.",
          standard: "Standard US at-will employment doctrine.",
          legal: "Standard statutory at-will employment definition."
        },
        actionInsight: "✅ Standard for US tech employment. Consider negotiating a severance provision (e.g. 2-3 months salary if terminated without cause)."
      }
    ],
    suggestedQuestions: [
      "Can I build an indie mobile app or SaaS on weekends?",
      "Do I own the patents or code I write in my bedroom on vacation?",
      "What happens if I get laid off? Is there guaranteed severance?",
      "Can I sue the company in court if they don't pay my wages?"
    ]
  },

  "saas-tos": {
    id: "saas-tos",
    title: "Cloud Software Terms of Service & Data Policy",
    category: "Consumer & Privacy Rights",
    parties: "Provider: CloudScale Enterprise LLC | User: Subscriber / Business",
    effectiveDate: "August 1, 2026",
    summary: "Cloud service terms containing broad data licensing rights for AI model training, unilateral pricing escalation without notice, and comprehensive warranty disclaimers.",
    clauses: [
      {
        id: "saas-c1",
        number: "Section 4.2",
        title: "Data License & AI Model Training Rights",
        category: "Privacy & Data Governance",
        riskLevel: "high",
        riskScore: 89,
        originalText: "By submitting, uploading, or displaying any content, proprietary documents, customer data, or code to the Platform, User grants Provider an irrevocable, perpetual, worldwide, royalty-free, transferable license to use, reproduce, modify, distribute, and train proprietary artificial intelligence and machine learning models on such data without attribution or compensation.",
        plainEnglish: {
          easy: "Everything you upload—private documents, company code, customer info—can be used forever by this company to train their AI models without paying you.",
          standard: "A sweeping license that surrenders your data confidentiality and allows the vendor to feed your proprietary secrets into their commercial AI models.",
          legal: "Broad perpetual sublicensable license granting machine learning training rights over confidential user data; compromises trade secrets and GDPR compliance."
        },
        actionInsight: "🚨 Critical: Enterprise users must opt out of AI model training and require immediate data deletion upon account termination."
      },
      {
        id: "saas-c2",
        number: "Section 7.1",
        title: "Unilateral Price Escalation Without Notice",
        category: "Financial Obligations",
        riskLevel: "med",
        riskScore: 68,
        originalText: "Provider reserves the right to modify subscription fees at any time in its sole discretion. Price adjustments shall become effective immediately and will be charged to User's credit card on file without prior notification.",
        plainEnglish: {
          easy: "The company can raise your subscription price at any time and charge your card right away without telling you beforehand.",
          standard: "Unilateral price increases with no advance notice period to cancel or evaluate.",
          legal: "Unilateral fee alteration clause lacking reasonable notice or cancellation cure periods."
        },
        actionInsight: "⚠️ Require at least 30 days written notice before any price adjustments take effect, with the right to cancel without penalty."
      },
      {
        id: "saas-c3",
        number: "Section 11.1",
        title: "Total Disclaimer of Warranty & 'As-Is' Status",
        category: "Liability & Indemnification",
        riskLevel: "med",
        riskScore: 58,
        originalText: "The Services are provided strictly 'AS IS' and 'AS AVAILABLE'. Provider expressly disclaims all warranties of any kind, whether express or implied, including warranties of merchantability, fitness for a particular purpose, uptime guarantee, and data loss prevention.",
        plainEnglish: {
          easy: "If the service goes down, crashes, or loses all your saved files, the company accepts zero blame and owes you nothing.",
          standard: "Standard boilerplate disclaimer of all warranties and reliability commitments.",
          legal: "UCC § 2-316 express disclaimer of implied warranties; leaves subscriber without recourse for catastrophic data corruption or outages."
        },
        actionInsight: "⚠️ For critical business software, require a Service Level Agreement (SLA) with guaranteed 99.9% uptime and monthly outage credits."
      }
    ],
    suggestedQuestions: [
      "Can this company train their AI models on my private files?",
      "Can they raise my subscription price without warning?",
      "What happens if their servers crash and lose my data?",
      "How do I cancel my account and ensure my data is erased?"
    ]
  },

  "mutual-nda": {
    id: "mutual-nda",
    title: "Bilateral Mutual Non-Disclosure Agreement",
    category: "Confidentiality & Business",
    parties: "Party A: Innovatech Labs | Party B: Partner Venture Corp",
    effectiveDate: "September 1, 2026",
    summary: "A balanced mutual NDA protecting both parties' proprietary information during initial partnership exploration.",
    clauses: [
      {
        id: "nda-c1",
        number: "Section 1.1",
        title: "Definition of Confidential Information",
        category: "Confidentiality",
        riskLevel: "low",
        riskScore: 25,
        originalText: "'Confidential Information' means all non-public technical, business, or financial information disclosed by one party to the other that is marked 'Confidential' or reasonably understood to be confidential given the nature of the information.",
        plainEnglish: {
          easy: "Explains what counts as a secret: anything labeled confidential or obviously intended to be private.",
          standard: "Standard mutual definition protecting business secrets without overly restrictive traps.",
          legal: "Balanced standard definition with both objective marking requirements and subjective context qualifiers."
        },
        actionInsight: "✅ Balanced and mutual."
      },
      {
        id: "nda-c2",
        number: "Section 3.2",
        title: "Term of Confidentiality Obligation",
        category: "Termination & Duration",
        riskLevel: "low",
        riskScore: 20,
        originalText: "The obligations of non-disclosure and non-use shall survive termination of this Agreement for a period of two (2) years, except for Trade Secrets which shall remain confidential for as long as they qualify as trade secrets under applicable law.",
        plainEnglish: {
          easy: "Both parties must keep secrets for 2 years. Real company trade secrets stay protected indefinitely.",
          standard: "Industry-standard 2-year duration with trade secret protection.",
          legal: "Reasonable 2-year sunset provision aligned with UTSA (Uniform Trade Secrets Act) standards."
        },
        actionInsight: "✅ Balanced and typical."
      }
    ],
    suggestedQuestions: [
      "How long do I have to keep their secrets?",
      "Does this contract protect my secrets as well as theirs?",
      "Can I discuss this partnership with my investors?"
    ]
  }
};
