/**
 * LexiPulse AI - Master Application Controller
 * Orchestrates views, state management, event listeners, and UI rendering.
 */

class LexiPulseApp {
  constructor() {
    this.currentDocId = "lease-agreement";
    this.currentReadingLevel = "standard";
    this.activeTab = "tab-analyzer";
    this.selectedClauseId = null;
    this.userDocuments = {};
    this.chatHistory = [];
    this.checklistState = {};

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadDocument(this.currentDocId);
    this.initChatWelcome();
    this.updateLiveApiBadge();
  }

  getCurrentDocument() {
    if (this.userDocuments[this.currentDocId]) {
      return this.userDocuments[this.currentDocId];
    }
    return SAMPLE_DOCUMENTS[this.currentDocId] || SAMPLE_DOCUMENTS["lease-agreement"];
  }

  openModal(modalId, triggerEl = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    this.lastFocusedElement = triggerEl || document.activeElement;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    const focusable = modal.querySelector("input:not([type=hidden]), textarea, select, button:not(.btn-icon)");
    if (focusable) {
      setTimeout(() => focusable.focus(), 50);
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === "function") {
      this.lastFocusedElement.focus();
    }
  }

  bindEvents() {
    // Tab Navigation
    document.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const targetView = tab.dataset.tab;
        this.switchTab(targetView);
      });
    });

    // Keyboard Arrow Navigation for WAI-ARIA Tablist
    const tabBar = document.querySelector(".nav-tab-bar");
    if (tabBar) {
      tabBar.addEventListener("keydown", (e) => {
        const tabs = Array.from(tabBar.querySelectorAll(".nav-tab"));
        const idx = tabs.findIndex(t => t === document.activeElement);
        if (idx === -1) return;
        let targetIdx = idx;
        if (e.key === "ArrowRight") {
          targetIdx = (idx + 1) % tabs.length;
        } else if (e.key === "ArrowLeft") {
          targetIdx = (idx - 1 + tabs.length) % tabs.length;
        } else if (e.key === "Home") {
          targetIdx = 0;
        } else if (e.key === "End") {
          targetIdx = tabs.length - 1;
        } else {
          return;
        }
        e.preventDefault();
        tabs[targetIdx].focus();
        tabs[targetIdx].click();
      });
    }

    // Global Escape Key listener to close active dialogs
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        ["upload-modal", "settings-modal", "output-modal"].forEach(id => {
          const m = document.getElementById(id);
          if (m && m.classList.contains("active")) {
            this.closeModal(id);
          }
        });
      }
    });

    // Document Selector dropdown
    const docSelect = document.getElementById("document-select");
    if (docSelect) {
      docSelect.addEventListener("change", (e) => {
        this.loadDocument(e.target.value);
      });
    }

    // Reading level buttons (Radio group semantics)
    document.querySelectorAll(".level-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".level-btn").forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-checked", "true");
        this.currentReadingLevel = btn.dataset.level;
        this.renderClausesFeed();
      });
    });

    // Chat form submit
    const chatForm = document.getElementById("chat-form");
    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleUserQuestion();
      });
    }

    // New Document Upload modal buttons
    const btnNewDoc = document.getElementById("btn-new-doc");
    const closeUploadBtn = document.getElementById("close-upload-modal");
    const cancelUploadBtn = document.getElementById("cancel-upload-btn");
    const submitUploadBtn = document.getElementById("submit-upload-btn");

    if (btnNewDoc) {
      btnNewDoc.addEventListener("click", (e) => this.openModal("upload-modal", e.currentTarget));
    }
    if (closeUploadBtn) closeUploadBtn.addEventListener("click", () => this.closeModal("upload-modal"));
    if (cancelUploadBtn) cancelUploadBtn.addEventListener("click", () => this.closeModal("upload-modal"));
    if (submitUploadBtn) {
      submitUploadBtn.addEventListener("click", () => this.handleCustomDocUpload());
    }

    // Settings Modal
    const btnSettings = document.getElementById("btn-settings");
    const closeSettingsBtn = document.getElementById("close-settings-modal");
    const saveSettingsBtn = document.getElementById("save-settings-btn");

    if (btnSettings) {
      btnSettings.addEventListener("click", (e) => {
        const keyInput = document.getElementById("settings-api-key");
        const modelSelect = document.getElementById("settings-model-select");
        if (keyInput) keyInput.value = GeminiClient.getApiKey();
        if (modelSelect) modelSelect.value = GeminiClient.getModel();
        this.openModal("settings-modal", e.currentTarget);
      });
    }
    if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", () => this.closeModal("settings-modal"));
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        const keyInput = document.getElementById("settings-api-key");
        const modelSelect = document.getElementById("settings-model-select");
        if (keyInput) GeminiClient.setApiKey(keyInput.value);
        if (modelSelect) GeminiClient.setModel(modelSelect.value);
        this.closeModal("settings-modal");
        this.updateLiveApiBadge();
        ExportUtils.showToast("AI Configuration Saved!", "success");
      });
    }

    // Action Hub Generator Buttons
    const btnGenBrief = document.getElementById("btn-gen-brief");
    const btnGenCounter = document.getElementById("btn-gen-counter");
    const btnPrintDoc = document.getElementById("btn-print-doc");

    if (btnGenBrief) {
      btnGenBrief.addEventListener("click", (e) => this.showOutputModal("Attorney Consultation Brief", LegalEngine.generateAttorneyBrief(this.getCurrentDocument()), e.currentTarget));
    }
    if (btnGenCounter) {
      btnGenCounter.addEventListener("click", (e) => this.showOutputModal("Negotiation Counter-Proposal", LegalEngine.generateNegotiationCounter(this.getCurrentDocument()), e.currentTarget));
    }
    if (btnPrintDoc) {
      btnPrintDoc.addEventListener("click", () => ExportUtils.printPage());
    }

    // Close output modal
    const closeOutputBtn = document.getElementById("close-output-modal");
    if (closeOutputBtn) {
      closeOutputBtn.addEventListener("click", () => this.closeModal("output-modal"));
    }
  }

  updateLiveApiBadge() {
    const badge = document.getElementById("api-status-badge");
    if (badge) {
      if (GeminiClient.hasLiveApiKey()) {
        badge.textContent = "Gemini Live API Active";
        badge.style.background = "rgba(16, 185, 129, 0.2)";
        badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
        badge.style.color = "#34D399";
      } else {
        badge.textContent = "Autonomous AI Engine Active";
        badge.style.background = "rgba(99, 102, 241, 0.2)";
        badge.style.borderColor = "rgba(99, 102, 241, 0.4)";
        badge.style.color = "#A5B4FC";
      }
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll(".nav-tab").forEach(tab => {
      const isActive = tab.dataset.tab === tabId;
      if (isActive) tab.classList.add("active");
      else tab.classList.remove("active");
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    document.querySelectorAll(".tab-view").forEach(view => {
      const isActive = view.id === tabId;
      if (isActive) {
        view.classList.add("active");
        view.removeAttribute("hidden");
      } else {
        view.classList.remove("active");
        view.setAttribute("hidden", "true");
      }
    });

    // Trigger tab-specific renders
    if (tabId === "tab-risk") {
      this.renderRiskRadar();
    } else if (tabId === "tab-diff") {
      this.renderDiffView();
    } else if (tabId === "tab-action") {
      this.renderChecklists();
    }
  }

  loadDocument(docId) {
    this.currentDocId = docId;
    const doc = this.getCurrentDocument();

    // Update Hero Stats
    this.renderDocHero(doc);

    // Render Clause Demystifier
    this.renderClausesFeed();

    // Render Risk Radar
    this.renderRiskRadar();

    // Render Suggested Questions in Copilot
    this.renderSuggestedQuestions(doc);

    // Render Action Hub
    this.renderChecklists();

    // Reset Diff if applicable
    this.renderDiffView();

    ExportUtils.showToast(`Loaded: ${doc.title}`, "info");
  }

  renderDocHero(doc) {
    const titleElem = document.getElementById("doc-hero-title");
    const metaElem = document.getElementById("doc-hero-meta");
    const statFairness = document.getElementById("hero-stat-fairness");
    const statRisks = document.getElementById("hero-stat-risks");
    const statClauses = document.getElementById("hero-stat-clauses");

    const metrics = LegalEngine.calculateFairnessMetrics(doc);

    if (titleElem) titleElem.textContent = doc.title;
    if (metaElem) {
      metaElem.innerHTML = `
        <span class="meta-chip">📁 <strong>${doc.category}</strong></span>
        <span class="meta-chip">🤝 <strong>${doc.parties}</strong></span>
        <span class="meta-chip">📅 Effective: <strong>${doc.effectiveDate}</strong></span>
      `;
    }

    if (statFairness) {
      statFairness.textContent = `${metrics.overallScore}/100`;
      statFairness.className = `stat-value score-${metrics.healthClass}`;
    }
    if (statRisks) {
      statRisks.textContent = `${metrics.highRiskCount}`;
      statRisks.className = `stat-value ${metrics.highRiskCount > 0 ? 'score-low' : 'score-high'}`;
    }
    if (statClauses) {
      statClauses.textContent = `${doc.clauses.length}`;
    }

    // Update counter badges in tabs
    const riskBadge = document.getElementById("tab-badge-risk");
    if (riskBadge) riskBadge.textContent = metrics.highRiskCount;
  }

  renderClausesFeed() {
    const doc = this.getCurrentDocument();
    const feed = document.getElementById("clauses-feed");
    if (!feed) return;

    feed.innerHTML = "";

    doc.clauses.forEach((c, idx) => {
      const card = document.createElement("div");
      card.className = `clause-card ${c.riskLevel}-risk ${this.selectedClauseId === c.id ? 'selected' : ''}`;
      card.id = `clause-${c.id}`;

      const plainText = c.plainEnglish[this.currentReadingLevel] || c.plainEnglish.standard;

      card.innerHTML = `
        <div class="clause-top">
          <span class="clause-number">${c.number} • ${c.category}</span>
          <span class="risk-pill ${c.riskLevel}">${c.riskLevel === 'high' ? '🚨 High Risk' : c.riskLevel === 'med' ? '⚠️ Caution' : '✅ Standard'}</span>
        </div>
        <div class="clause-title">${c.title}</div>
        <div class="clause-original-text">${c.originalText}</div>
        <div class="plain-explanation-box">
          <div class="plain-explanation-header">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Plain English Breakdown (${this.currentReadingLevel})
          </div>
          <div class="plain-text">${plainText}</div>
          <div class="clause-action-insight ${c.riskLevel === 'high' ? '' : c.riskLevel === 'med' ? 'med' : 'safe'}">
            ${c.actionInsight}
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        this.selectedClauseId = c.id;
        document.querySelectorAll(".clause-card").forEach(el => el.classList.remove("selected"));
        card.classList.add("selected");
      });

      feed.appendChild(card);
    });
  }

  renderRiskRadar() {
    const doc = this.getCurrentDocument();
    const metrics = LegalEngine.calculateFairnessMetrics(doc);

    // Render Dial SVG
    const scoreValElem = document.getElementById("gauge-score-value");
    const scoreLabelElem = document.getElementById("gauge-score-label");
    const gaugePath = document.getElementById("gauge-meter-path");

    if (scoreValElem) scoreValElem.textContent = metrics.overallScore;
    if (scoreLabelElem) {
      scoreLabelElem.textContent = metrics.healthRating;
      scoreLabelElem.className = `gauge-score-label score-${metrics.healthClass}`;
    }

    if (gaugePath) {
      // Semi-circle circumference = PI * r = 3.14159 * 80 = ~251.3
      const totalLen = 251.3;
      const progress = (metrics.overallScore / 100) * totalLen;
      gaugePath.style.strokeDasharray = `${totalLen}`;
      gaugePath.style.strokeDashoffset = `${totalLen - progress}`;
      gaugePath.style.stroke = metrics.healthClass === 'high' ? 'var(--risk-low)' : metrics.healthClass === 'med' ? 'var(--risk-med)' : 'var(--risk-high)';
    }

    // Render Vector Progress Bars
    const vectorContainer = document.getElementById("vector-bars-container");
    if (vectorContainer) {
      const vectorData = [
        { label: "Liability & Indemnification", score: metrics.vectors.liability, icon: "🛡️" },
        { label: "Intellectual Property Rights", score: metrics.vectors.ip, icon: "💡" },
        { label: "Financial Terms & Penalties", score: metrics.vectors.financial, icon: "💰" },
        { label: "Termination & Notice Windows", score: metrics.vectors.termination, icon: "⏳" },
        { label: "Dispute Resolution & Forum", score: metrics.vectors.dispute, icon: "⚖️" }
      ];

      vectorContainer.innerHTML = vectorData.map(v => `
        <div class="vector-item">
          <div class="vector-header">
            <span class="vector-label">${v.icon} ${v.label}</span>
            <span class="vector-score" style="color: ${v.score > 70 ? 'var(--risk-low)' : v.score > 40 ? 'var(--risk-med)' : 'var(--risk-high)'}">${v.score}% Safe</span>
          </div>
          <div class="vector-bar-track">
            <div class="vector-bar-fill" style="width: ${v.score}%; background: ${v.score > 70 ? 'var(--risk-low)' : v.score > 40 ? 'var(--risk-med)' : 'var(--risk-high)'};"></div>
          </div>
        </div>
      `).join("");
    }

    // Render Flagged Clauses
    const flaggedContainer = document.getElementById("flagged-clauses-container");
    if (flaggedContainer) {
      const dangerous = doc.clauses.filter(c => c.riskLevel === "high" || c.riskLevel === "med");
      if (dangerous.length === 0) {
        flaggedContainer.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
            🎉 No critical red flags detected! This agreement conforms with standard mutual terms.
          </div>
        `;
      } else {
        flaggedContainer.innerHTML = dangerous.map(c => `
          <div class="flagged-item ${c.riskLevel === 'high' ? 'critical' : 'warning'}">
            <div class="flagged-icon">
              ${c.riskLevel === 'high' ? '🚨' : '⚠️'}
            </div>
            <div class="flagged-content">
              <div class="flagged-heading">
                ${c.number}: ${c.title}
                <span class="risk-pill ${c.riskLevel}">${c.riskLevel === 'high' ? 'Critical Red Flag' : 'Caution'}</span>
              </div>
              <div class="flagged-desc">${c.plainEnglish.standard}</div>
              <div class="flagged-solution">
                💡 Recommended Fix: ${c.actionInsight.replace(/^[🚨⚠️✅]\s*/, '')}
              </div>
            </div>
          </div>
        `).join("");
      }
    }
  }

  renderDiffView() {
    const doc = this.getCurrentDocument();
    const comparison = ComparisonEngine.compareDocuments(doc, SAMPLE_DOCUMENTS["lease-agreement"]);
    const diffContainer = document.getElementById("diff-results-container");
    if (!diffContainer) return;

    const titleA = document.getElementById("diff-title-v1");
    const titleB = document.getElementById("diff-title-v2");
    if (titleA) titleA.textContent = comparison.v1Title || "Original Draft";
    if (titleB) titleB.textContent = comparison.v2Title || "Client Redline";

    const shifts = comparison.shifts || [];
    if (shifts.length === 0) {
      diffContainer.innerHTML = `
        <div style="grid-column: span 2; padding: 30px; text-align: center; color: var(--text-secondary);">
          ℹ️ Select a document with multiple drafts (such as the <strong>Freelance Software Engineering Agreement</strong>) to visualize redline shifts and semantic traps side-by-side.
        </div>
      `;
      return;
    }

    diffContainer.innerHTML = shifts.map(shift => `
      <div class="diff-clause-box ${shift.status}">
        <div class="diff-impact-badge ${shift.impact}">
          ${shift.status.toUpperCase()} • ${shift.impact.toUpperCase()} IMPACT
        </div>
        <div style="font-weight: 700; margin-bottom: 6px;">${shift.clause} (V1)</div>
        <div style="font-size: 0.82rem; color: #94A3B8; margin-bottom: 8px;">${shift.v1Text}</div>
      </div>
      <div class="diff-clause-box ${shift.status}">
        <div class="diff-impact-badge ${shift.impact}">
          SHIFT ANALYSIS
        </div>
        <div style="font-weight: 700; margin-bottom: 6px;">${shift.clause} (V2 Redline)</div>
        <div style="font-size: 0.82rem; color: #E2E8F0; margin-bottom: 8px;">${shift.v2Text}</div>
        <div style="font-size: 0.76rem; color: #38BDF8; background: rgba(6, 182, 212, 0.1); padding: 6px 8px; border-radius: 4px;">
          🔍 <strong>AI Shift Impact:</strong> ${shift.aiAnalysis}
        </div>
      </div>
    `).join("");
  }

  initChatWelcome() {
    const chatFeed = document.getElementById("chat-feed");
    if (!chatFeed) return;

    chatFeed.innerHTML = `
      <div class="chat-bubble ai">
        <div class="chat-avatar ai">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div class="bubble-content">
          Hello! I am your <strong>LexiPulse Legal Copilot</strong>. I have indexed this agreement and can answer specific questions with direct, cited clauses.<br><br>
          Try asking about your rights, payment terms, unannounced visits, or hidden liabilities.
        </div>
      </div>
    `;
  }

  renderSuggestedQuestions(doc) {
    const container = document.getElementById("suggested-questions-feed");
    if (!container) return;

    const questions = doc.suggestedQuestions || [
      "What are the main risks in this agreement?",
      "Can I terminate this contract early?",
      "Who owns the intellectual property?"
    ];

    container.innerHTML = questions.map(q => `
      <button class="question-chip-btn" data-question="${q}">
        💬 ${q}
      </button>
    `).join("");

    container.querySelectorAll(".question-chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = document.getElementById("chat-input");
        if (input) {
          input.value = btn.dataset.question;
          this.handleUserQuestion();
        }
      });
    });
  }

  async handleUserQuestion() {
    const input = document.getElementById("chat-input");
    const chatFeed = document.getElementById("chat-feed");
    if (!input || !chatFeed || !input.value.trim()) return;

    const question = input.value.trim();
    input.value = "";

    // Append User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    userBubble.innerHTML = `
      <div class="chat-avatar user">👤</div>
      <div class="bubble-content">${this.escapeHtml(question)}</div>
    `;
    chatFeed.appendChild(userBubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    // Append AI Typing Indicator
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble ai typing";
    typingBubble.innerHTML = `
      <div class="chat-avatar ai">⚡</div>
      <div class="bubble-content">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    chatFeed.appendChild(typingBubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    const doc = this.getCurrentDocument();

    // Check Gemini API vs Autonomous Legal Engine
    let finalAnswer = "";
    let citations = [];

    if (GeminiClient.hasLiveApiKey()) {
      const systemPrompt = `You are LexiPulse AI, an expert legal assistant. Analyze the following contract titled "${doc.title}" and answer the user question factually in plain English with direct citations. Format citations as [Clause Number]. Always include a reminder that this is educational assistance, not professional legal counsel.\n\nDocument text:\n${doc.clauses.map(c => `${c.number} (${c.title}): ${c.originalText}`).join("\n\n")}`;
      const result = await GeminiClient.generateResponse(systemPrompt, question);
      if (result.text) {
        finalAnswer = result.text;
      }
    }

    if (!finalAnswer) {
      const queryResult = LegalEngine.queryDocument(doc, question);
      finalAnswer = queryResult.answer;
      citations = queryResult.citations;
    }

    // Remove typing indicator
    if (typingBubble.parentElement) typingBubble.parentElement.removeChild(typingBubble);

    // Append AI Answer Bubble
    const aiBubble = document.createElement("div");
    aiBubble.className = "chat-bubble ai";

    const citationsHtml = citations.map(c => `
      <span class="bubble-citation-tag" onclick="window.app.scrollToClause('${c.id}')">
        📜 ${c.number}: ${c.title}
      </span>
    `).join(" ");

    aiBubble.innerHTML = `
      <div class="chat-avatar ai">⚡</div>
      <div class="bubble-content">
        ${this.formatMarkdownText(finalAnswer)}
        ${citations.length > 0 ? `<div style="margin-top: 10px; font-size: 0.75rem; color: #94A3B8;">Source Citations (Click to view clause):</div><div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">${citationsHtml}</div>` : ''}
      </div>
    `;
    chatFeed.appendChild(aiBubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  scrollToClause(clauseId) {
    this.switchTab("tab-analyzer");
    setTimeout(() => {
      const el = document.getElementById(`clause-${clauseId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("selected");
      }
    }, 150);
  }

  renderChecklists() {
    const doc = this.getCurrentDocument();
    const obligations = LegalEngine.generateObligationsChecklist(doc);
    const container = document.getElementById("obligations-checklist-container");
    if (!container) return;

    container.innerHTML = obligations.map((item, idx) => {
      const safeKey = this.escapeHtml(item.task);
      const safeTask = this.escapeHtml(item.task);
      const safeDetail = this.escapeHtml(item.detail);
      const isDone = this.checklistState[item.task] ? 'done' : '';
      const isChecked = this.checklistState[item.task] ? 'checked' : '';
      return `
      <div class="checklist-item ${isDone}" onclick="window.app.toggleChecklist('${safeKey}')">
        <input type="checkbox" class="checklist-checkbox" ${isChecked} onclick="event.stopPropagation(); window.app.toggleChecklist('${safeKey}')">
        <div class="checklist-text">
          <strong>${safeTask}</strong>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${safeDetail}</div>
        </div>
      </div>
    `;
    }).join("");
  }

  toggleChecklist(taskKey) {
    this.checklistState[taskKey] = !this.checklistState[taskKey];
    this.renderChecklists();
  }

  showOutputModal(title, content, triggerEl = null) {
    const modal = document.getElementById("output-modal");
    const modalTitle = document.getElementById("output-modal-title");
    const modalBody = document.getElementById("output-modal-body");
    const copyBtn = document.getElementById("output-copy-btn");
    const downloadBtn = document.getElementById("output-download-btn");

    if (!modal) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = `<pre style="font-family: var(--font-mono); font-size: 0.82rem; white-space: pre-wrap; color: var(--text-secondary); background: rgba(0,0,0,0.3); padding: 14px; border-radius: 8px;">${this.escapeHtml(content)}</pre>`;

    if (copyBtn) {
      copyBtn.onclick = () => ExportUtils.copyToClipboard(content, `Copied ${title}!`);
    }
    if (downloadBtn) {
      downloadBtn.onclick = () => ExportUtils.downloadFile(`${title.toLowerCase().replace(/\s+/g, '_')}.md`, content);
    }

    this.openModal("output-modal", triggerEl);
  }

  handleCustomDocUpload() {
    const titleInput = document.getElementById("upload-doc-title");
    const textInput = document.getElementById("upload-doc-text");

    if (!textInput || !textInput.value.trim()) {
      ExportUtils.showToast("Please paste or type contract text to analyze.", "error");
      return;
    }

    const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : "Custom Agreement";
    const parsedDoc = DocumentParser.parseRawText(textInput.value.trim(), title);

    this.userDocuments[parsedDoc.id] = parsedDoc;

    // Add to dropdown
    const select = document.getElementById("document-select");
    if (select) {
      const opt = document.createElement("option");
      opt.value = parsedDoc.id;
      opt.textContent = `⭐ ${parsedDoc.title}`;
      select.prepend(opt);
      select.value = parsedDoc.id;
    }

    this.closeModal("upload-modal");
    textInput.value = "";
    if (titleInput) titleInput.value = "";

    this.loadDocument(parsedDoc.id);
    ExportUtils.showToast("Contract parsed and demystified successfully!", "success");
  }

  formatMarkdownText(text) {
    if (!text) return "";
    // Apply markdown FIRST, then sanitize only the non-markdown segments
    // This preserves Gemini AI rich formatting while preventing XSS
    return text
      // Headers
      .replace(/^### (.+)$/gm, '<h4 style="margin:8px 0 4px;font-size:0.9rem;color:var(--primary);">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="margin:10px 0 4px;font-size:0.95rem;color:var(--primary);">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 style="margin:10px 0 6px;font-size:1rem;color:var(--primary);">$1</h2>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em;">$1</code>')
      // Blockquotes
      .replace(/^>\s*(.+?)$/gm, '<blockquote style="border-left:3px solid var(--primary);padding-left:10px;margin:8px 0;color:var(--text-secondary);font-style:italic;">$1</blockquote>')
      // Bullet lists
      .replace(/^[*-] (.+)$/gm, '<li style="margin-left:16px;margin-bottom:2px;">$1</li>')
      // Numbered lists
      .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:16px;margin-bottom:2px;">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p style="margin:6px 0;">')
      .replace(/\n/g, '<br>');
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global initialization on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new LexiPulseApp();
});
