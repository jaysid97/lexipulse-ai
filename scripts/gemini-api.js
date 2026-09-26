/**
 * LexiPulse AI - Gemini GenAI Client & Dual-Mode Reasoning
 * Supports real-time Google Gemini API calls (streaming / REST)
 * with robust offline semantic reasoning fallback.
 */

const GeminiClient = {
  getApiKey() {
    return localStorage.getItem("lexipulse_gemini_api_key") || "";
  },

  setApiKey(key) {
    if (key) {
      localStorage.setItem("lexipulse_gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("lexipulse_gemini_api_key");
    }
  },

  getModel() {
    return localStorage.getItem("lexipulse_gemini_model") || "gemini-2.5-flash";
  },

  setModel(model) {
    localStorage.setItem("lexipulse_gemini_model", model);
  },

  hasLiveApiKey() {
    const key = this.getApiKey();
    return Boolean(key && key.length > 15);
  },

  /**
   * Main generation function: calls live Gemini API if key is present,
   * otherwise uses the high-precision legal engine fallback.
   */
  async generateResponse(systemPrompt, userPrompt, onStreamChunk = null) {
    const apiKey = this.getApiKey();

    if (this.hasLiveApiKey()) {
      try {
        const model = this.getModel();
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nTask:\n${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${response.status}: API request failed`);
        }

        const data = await response.json();
        let fullText = "";

        if (Array.isArray(data)) {
          data.forEach(chunk => {
            const candidate = chunk.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text || "";
            fullText += text;
            if (onStreamChunk) onStreamChunk(fullText);
          });
        } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          fullText = data.candidates[0].content.parts[0].text;
          if (onStreamChunk) onStreamChunk(fullText);
        }

        return {
          text: fullText,
          isLiveAPI: true
        };
      } catch (err) {
        console.warn("Live Gemini API call failed, falling back to local legal reasoning engine:", err);
        // Seamless fallback
      }
    }

    // High-precision simulated delay for natural UX
    await new Promise(r => setTimeout(r, 450));
    return {
      text: null, // Signals caller to use LegalEngine's grounded output
      isLiveAPI: false
    };
  }
};
