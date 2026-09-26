/**
 * LexiPulse AI - Export & Utilities Library
 * Handles Markdown downloads, clipboard copying, printing, and toast notifications.
 */

const ExportUtils = {
  /**
   * Copy text to clipboard and show toast
   */
  async copyToClipboard(text, successMessage = "Copied to clipboard!") {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      this.showToast(successMessage, "success");
      return true;
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      this.showToast("Failed to copy. Please select and copy manually.", "error");
      return false;
    }
  },

  /**
   * Download content as a markdown/text file
   */
  downloadFile(filename, content, mimeType = "text/markdown") {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showToast(`Downloaded ${filename}`, "success");
  },

  /**
   * Trigger print dialog
   */
  printPage() {
    window.print();
  },

  /**
   * Visual Toast Notification
   */
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.bottom = "24px";
      container.style.right = "24px";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "8px";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast-pill toast-${type}`;
    toast.style.padding = "10px 18px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "0.85rem";
    toast.style.fontWeight = "600";
    toast.style.color = "#FFF";
    toast.style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.animation = "fadeIn 0.25s ease-out";
    toast.style.transition = "opacity 0.3s ease";

    if (type === "success") {
      toast.style.background = "#059669";
      toast.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> ${message}`;
    } else if (type === "error") {
      toast.style.background = "#DC2626";
      toast.innerHTML = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> ${message}`;
    } else {
      toast.style.background = "#4F46E5";
      toast.innerHTML = `ℹ️ ${message}`;
    }

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }, 3200);
  }
};
