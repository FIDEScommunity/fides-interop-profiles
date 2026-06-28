(function () {
  "use strict";

  const config = window.FIDES_VOCABULARY_FORM_CONFIG || {};
  const mode = config.mode === "update" ? "update" : "create";
  const root =
    document.getElementById(
      mode === "update" ? "fides-vocabulary-update-form-root" : "fides-vocabulary-submit-form-root"
    ) || document.querySelector(".fides-vocabulary-submission-root");
  if (!root) return;

  const apiBase = String(config.apiBase || "").replace(/\/$/, "");
  const restNonce = String(config.restNonce || "").trim();
  const contactEmail = String(config.contactEmail || "").trim();
  const fieldHelp = config.fieldHelp && typeof config.fieldHelp === "object" ? config.fieldHelp : {};
  const sectionIntro = String(config.sectionIntro || "").trim();
  let selectedTermId = mode === "update" ? String(config.preselectTermId || "").trim() : "";
  let selectedTermLabel = "";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function helpHtml(key) {
    const text = fieldHelp[key] ? String(fieldHelp[key]) : "";
    return text ? `<p class="fides-help">${escapeHtml(text)}</p>` : "";
  }

  function submissionItemUrl(itemId) {
    const segment = encodeURIComponent(String(itemId || "").trim());
    return `${apiBase}/submissions/vocabulary/${segment}`;
  }

  function aliasesToString(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    return typeof value === "string" ? value : "";
  }

  function parseAliases(raw) {
    return String(raw || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function formFieldsHtml() {
    return `
      <div class="fides-form-section-body fides-vocab-fields" ${mode === "update" ? "hidden" : ""}>
        <div class="fides-form-row">
          <label for="fides-vocab-key">Term key *</label>
          ${helpHtml("key")}
          <input id="fides-vocab-key" type="text" required ${mode === "update" ? 'readonly class="fides-input-locked"' : ""} placeholder="e.g. agentic_ai" />
        </div>
        <div class="fides-form-row">
          <label for="fides-vocab-title">Display title</label>
          ${helpHtml("title")}
          <input id="fides-vocab-title" type="text" placeholder="Optional display title" />
        </div>
        <div class="fides-form-row">
          <label for="fides-vocab-description">Description *</label>
          ${helpHtml("description")}
          <textarea id="fides-vocab-description" rows="4" required placeholder="Short explanation of the term"></textarea>
        </div>
        <div class="fides-form-row">
          <label for="fides-vocab-url">Source URL</label>
          ${helpHtml("url")}
          <input id="fides-vocab-url" type="url" inputmode="url" placeholder="https://…" />
        </div>
        <div class="fides-form-row">
          <label for="fides-vocab-aliases">Aliases</label>
          ${helpHtml("aliases")}
          <input id="fides-vocab-aliases" type="text" placeholder="LSP, Large Scale Pilot" />
        </div>
        ${
          contactEmail
            ? `<div class="fides-form-row">
          <label for="fides-vocab-contact">Your account email (for review) *</label>
          ${helpHtml("contactEmail") || '<p class="fides-help">Taken from your FIDES account; used for submission review only.</p>'}
          <input id="fides-vocab-contact" class="fides-input-locked" type="email" value="${escapeHtml(contactEmail)}" readonly aria-readonly="true" tabindex="-1" />
        </div>`
            : `<p class="fides-form-message is-error">Your WordPress profile must have a valid email address before you can submit.</p>`
        }
      </div>`;
  }

  const sectionTitle = mode === "update" ? "Suggest a glossary update" : "Propose a new glossary term";
  const sectionIntroHtml = sectionIntro
    ? `<p class="fides-form-section-intro">${escapeHtml(sectionIntro)}</p>`
    : "";

  root.innerHTML = `
    <section class="fides-use-case-card">
      <form id="fides-vocab-form" class="fides-use-case-form fides-vocab-form fides-org-form">
        <section class="fides-form-section fides-form-section-first" aria-labelledby="fides-vocab-section-title">
          <div class="fides-form-accordion-heading">
            <h3 id="fides-vocab-section-title" class="fides-form-section-title">${escapeHtml(sectionTitle)}</h3>
          </div>
          ${sectionIntroHtml}
          ${
            mode === "update"
              ? `<div id="fides-vocab-update-picker" class="fides-form-section-body fides-org-update-picker-body">
            <div id="fides-vocab-search-block" class="fides-linked-field">
              <label for="fides-vocab-search">Find term *</label>
              ${helpHtml("termSearch")}
              <div class="fides-linked-inputs">
                <input id="fides-vocab-search" type="text" autocomplete="off" placeholder="Start typing…" />
              </div>
              <div class="fides-lookup-panel">
                <p id="fides-vocab-lookup-hint" class="fides-lookup-hint" hidden></p>
                <ul id="fides-vocab-lookup-results" class="fides-lookup-results" role="listbox" aria-label="Search results"></ul>
              </div>
            </div>
            <div id="fides-vocab-update-banner" class="fides-update-banner-row" hidden>
              <div class="fides-update-banner">
                <span class="fides-update-banner-label">Updating:</span>
                <strong id="fides-vocab-update-name"></strong>
                <code id="fides-vocab-update-id"></code>
              </div>
              <button type="button" class="fides-secondary-btn" id="fides-vocab-change">Choose different</button>
            </div>
          </div>`
              : ""
          }
          ${formFieldsHtml()}
        </section>
        <div id="fides-vocab-submit-block" class="fides-org-submit-block"${mode === "update" ? " hidden" : ""}>
          <div class="fides-consent">
            <label><input type="checkbox" name="consentPublish" required /> I confirm this information may be published *</label>
          </div>
          <div class="fides-form-actions">
            <button type="submit">${mode === "update" ? "Submit update proposal" : "Submit new term"}</button>
          </div>
        </div>
        <p id="fides-vocab-form-message" class="fides-form-message" aria-live="polite"></p>
      </form>
    </section>
  `;

  const form = root.querySelector("#fides-vocab-form");
  const messageEl = root.querySelector("#fides-vocab-form-message");
  const fieldsWrap = root.querySelector(".fides-vocab-fields");
  const submitBlock = root.querySelector("#fides-vocab-submit-block");
  const searchInput = root.querySelector("#fides-vocab-search");
  const lookupResults = root.querySelector("#fides-vocab-lookup-results");
  const lookupHint = root.querySelector("#fides-vocab-lookup-hint");
  const updateBanner = root.querySelector("#fides-vocab-update-banner");
  const searchBlock = root.querySelector("#fides-vocab-search-block");
  const updateNameEl = root.querySelector("#fides-vocab-update-name");
  const updateIdEl = root.querySelector("#fides-vocab-update-id");
  const changeBtn = root.querySelector("#fides-vocab-change");

  function setMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text || "";
    messageEl.className = `fides-form-message ${type ? `is-${type}` : ""}`.trim();
    messageEl.hidden = !text;
    if (text) {
      messageEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function fillForm(payload) {
    const data = payload && typeof payload === "object" ? payload : {};
    const keyEl = root.querySelector("#fides-vocab-key");
    const titleEl = root.querySelector("#fides-vocab-title");
    const descEl = root.querySelector("#fides-vocab-description");
    const urlEl = root.querySelector("#fides-vocab-url");
    const aliasesEl = root.querySelector("#fides-vocab-aliases");
    if (keyEl) keyEl.value = data.key || "";
    if (titleEl) titleEl.value = data.title || "";
    if (descEl) descEl.value = data.description || "";
    if (urlEl) urlEl.value = data.url || "";
    if (aliasesEl) aliasesEl.value = aliasesToString(data.aliases);
  }

  function buildPayload() {
    return {
      key: String(root.querySelector("#fides-vocab-key")?.value || "").trim(),
      title: String(root.querySelector("#fides-vocab-title")?.value || "").trim(),
      description: String(root.querySelector("#fides-vocab-description")?.value || "").trim(),
      url: String(root.querySelector("#fides-vocab-url")?.value || "").trim(),
      aliases: parseAliases(root.querySelector("#fides-vocab-aliases")?.value || ""),
    };
  }

  function revealFields(show) {
    if (fieldsWrap) fieldsWrap.hidden = !show;
  }

  function showUpdateSelectionUi() {
    const hasSelection = Boolean(selectedTermId);
    if (updateBanner) updateBanner.hidden = !hasSelection;
    if (searchBlock) searchBlock.hidden = hasSelection;
    if (submitBlock && mode === "update") submitBlock.hidden = !hasSelection;
    if (!hasSelection) {
      if (updateNameEl) updateNameEl.textContent = "";
      if (updateIdEl) updateIdEl.textContent = "";
      return;
    }
    if (updateNameEl) updateNameEl.textContent = selectedTermLabel || selectedTermId;
    if (updateIdEl) updateIdEl.textContent = selectedTermId;
  }

  async function lookupFetch(query) {
    const url = `${apiBase}/lookups/vocabulary?q=${encodeURIComponent(query)}`;
    const headers = {};
    if (restNonce) headers["X-WP-Nonce"] = restNonce;
    const response = await fetch(url, { credentials: "same-origin", headers });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.message || "Lookup failed.");
    return {
      content: Array.isArray(json.content) ? json.content : [],
      totalMatches: Number(json.totalMatches) || 0,
    };
  }

  async function loadItemPayload(itemId) {
    const url = submissionItemUrl(itemId);
    if (!url) {
      setMessage("Invalid term id.", "error");
      return;
    }
    setMessage("Loading term details…", "");
    const headers = {};
    if (restNonce) headers["X-WP-Nonce"] = restNonce;
    try {
      const response = await fetch(url, { credentials: "same-origin", headers });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(json.message || "Could not load term details.", "error");
        return;
      }
      fillForm(json.payload || {});
      revealFields(true);
      setMessage("", "");
    } catch (_err) {
      setMessage("Could not load term details due to a network error.", "error");
    }
  }

  async function selectTerm(item) {
    selectedTermId = String(item.id || "").trim();
    selectedTermLabel = String(item.label || selectedTermId).trim();
    if (lookupResults) lookupResults.innerHTML = "";
    if (lookupHint) lookupHint.hidden = true;
    showUpdateSelectionUi();
    await loadItemPayload(selectedTermId);
  }

  function resetUpdateSelection() {
    selectedTermId = "";
    selectedTermLabel = "";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
    showUpdateSelectionUi();
    revealFields(false);
    fillForm({});
    setMessage("", "");
  }

  if (mode === "update" && searchInput && lookupResults) {
    showUpdateSelectionUi();
    let debounceTimer = null;

    function setLookupHint(message) {
      if (!lookupHint) return;
      if (!message) {
        lookupHint.hidden = true;
        lookupHint.textContent = "";
        return;
      }
      lookupHint.hidden = false;
      lookupHint.textContent = message;
    }

    function renderLookupOption(item, idx) {
      const title = escapeHtml(item.label || "Unnamed");
      const subtitle = item.subtitle ? escapeHtml(item.subtitle) : "";
      return (
        `<li><button type="button" class="fides-lookup-option" data-result-index="${idx}" ` +
        `aria-label="Select ${title}${subtitle ? `, ${subtitle}` : ""}">` +
        `<span class="fides-lookup-option-main">` +
        `<span class="fides-lookup-option-title">${title}</span>` +
        (subtitle ? `<span class="fides-lookup-option-subtitle">${subtitle}</span>` : "") +
        `</span>` +
        `<span class="fides-lookup-option-action">Select</span>` +
        `</button></li>`
      );
    }

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        lookupResults.innerHTML = "";
        setLookupHint("");
        if (query.length < 2) return;
        try {
          const { content, totalMatches } = await lookupFetch(query);
          const items = content.slice(0, 8);
          if (!items.length) {
            setLookupHint("No matches. Check spelling or propose a new term instead.");
            return;
          }
          setLookupHint(
            totalMatches === 1 ? "1 match — click to select" : `${totalMatches} matches — click to select`
          );
          lookupResults.innerHTML = items.map((item, idx) => renderLookupOption(item, idx)).join("");
          lookupResults.querySelectorAll("[data-result-index]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const picked = items[Number(btn.getAttribute("data-result-index"))];
              if (picked) selectTerm(picked);
            });
          });
        } catch (err) {
          setLookupHint(err.message || "Lookup failed.");
        }
      }, 250);
    });

    if (changeBtn) changeBtn.addEventListener("click", resetUpdateSelection);

    if (selectedTermId) {
      selectedTermLabel = selectedTermId;
      showUpdateSelectionUi();
      loadItemPayload(selectedTermId);
    }
  }

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!contactEmail) {
      setMessage("Your WordPress profile must have a valid email address before submitting.", "error");
      return;
    }
    if (mode === "update" && !selectedTermId) {
      setMessage("Select the term you want to update.", "error");
      return;
    }

    const payload = buildPayload();
    if (!payload.key) {
      setMessage("Term key is required.", "error");
      return;
    }
    if (!payload.description) {
      setMessage("Description is required.", "error");
      return;
    }

    const url = mode === "update" ? submissionItemUrl(selectedTermId) : `${apiBase}/submissions/vocabulary`;
    setMessage("Submitting…", "");
    const headers = { "Content-Type": "application/json" };
    if (restNonce) headers["X-WP-Nonce"] = restNonce;

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(json.message || "Submission failed.", "error");
        return;
      }
      const ref = json.itemId || payload.key;
      setMessage(
        mode === "update"
          ? `Update proposal received for ${ref}. It will be reviewed before publication.`
          : `Submission received (${ref}). It will be reviewed before publication.`,
        "success"
      );
      if (mode === "create") {
        form.reset();
        const contactEl = root.querySelector("#fides-vocab-contact");
        if (contactEl && contactEmail) contactEl.value = contactEmail;
      } else {
        selectedTermId = "";
        selectedTermLabel = "";
        if (searchInput) searchInput.value = "";
        if (lookupResults) lookupResults.innerHTML = "";
        if (lookupHint) {
          lookupHint.hidden = true;
          lookupHint.textContent = "";
        }
        revealFields(false);
        showUpdateSelectionUi();
      }
    } catch (err) {
      setMessage(err.message || "Submission failed.", "error");
    }
  });
})();
