/**
 * FIDES Interop Profile Matrix
 * © 2026 FIDES Labs BV
 */

(function() {
  'use strict';

  // Capability groups with labels for the matrix
  const CAPABILITY_GROUPS = [
    {
      key: 'issuanceProtocol',
      label: 'Issuance Protocol',
      items: [
        { key: 'oid4vci', label: 'OID4VCI', hasVersion: true },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'presentationProtocol',
      label: 'Presentation Protocol',
      items: [
        { key: 'oid4vp', label: 'OID4VP', hasVersion: true },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'credentialFormat',
      label: 'Credential Format',
      items: [
        { key: 'sdJwtVc', label: 'SD-JWT VC' },
        { key: 'isoMdoc', label: 'ISO mDL' },
        { key: 'vcdm20', label: 'VCDM 2.0' }
      ]
    },
    {
      key: 'credentialIssuerIdentifiers',
      label: 'Issuer Identifiers',
      items: [
        { key: 'httpsIss', label: 'HTTPS ISS' },
        { key: 'x509DocumentSigner', label: 'X.509 Document Signer' },
        { key: 'didWeb', label: 'did:web' },
        { key: 'didWebvh', label: 'did:webvh' },
        { key: 'didJwk', label: 'did:jwk' },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'credentialHolderBinding',
      label: 'Holder Binding',
      items: [
        { key: 'cnfKeyBinding', label: 'CNF Key Binding' },
        { key: 'deviceBound', label: 'Device Bound' },
        { key: 'didWebOrganisations', label: 'did:web (Orgs)' },
        { key: 'didJwkPersons', label: 'did:jwk (Persons)' },
        { key: 'didWebvh', label: 'did:webvh' },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'verifierAuthentication',
      label: 'Verifier Authentication',
      items: [
        { key: 'openidClientIdAuth', label: 'OpenID Client ID Auth' },
        { key: 'x509ReaderCertificate', label: 'X.509 Reader Cert' },
        { key: 'didWeb', label: 'did:web' },
        { key: 'didWebvh', label: 'did:webvh' },
        { key: 'didJwk', label: 'did:jwk' },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'credentialStatus',
      label: 'Credential Status',
      items: [
        { key: 'jwtValidity', label: 'JWT Validity' },
        { key: 'pkiCertValidity', label: 'PKI Cert Validity' },
        { key: 'ietfTokenStatusList', label: 'IETF Token Status List' },
        { key: 'w3cStatusList2021', label: 'W3C Status List 2021' },
        { key: 'w3cBitstringStatusList', label: 'W3C Bitstring Status List' },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'signatureScheme',
      label: 'Signature Scheme',
      items: [
        { key: 'joseJws', label: 'JOSE JWS' },
        { key: 'cose', label: 'COSE' },
        { key: 'w3cDataIntegrity', label: 'W3C Data Integrity' },
        { key: 'other', label: 'Other' }
      ]
    },
    {
      key: 'signatureAlgorithms',
      label: 'Signature Algorithms',
      items: [
        { key: 'ecdsaEs256', label: 'ECDSA ES256' },
        { key: 'eddsa', label: 'EdDSA' },
        { key: 'rsa', label: 'RSA' },
        { key: 'pqOther', label: 'Post-Quantum / Other' }
      ]
    }
  ];

  let currentData = null;
  let currentMobileProfileIndex = 0;
  let hideEmptyRows = localStorage.getItem('fides-interop-hide-empty') === 'true';
  let selectedProfiles = [];
  const MAX_SELECTED_PROFILES = 3;

  /**
   * Initialize the matrix
   */
  function init() {
    const root = document.getElementById('fides-interop-matrix-root');
    if (!root) return;

    const profilesFilter = root.dataset.profiles || '';
    const theme = root.dataset.theme || 'fides';

    loadData(profilesFilter).then(data => {
      currentData = data;
      render(root, data, theme);
      initMobileGestures(root);
    }).catch(error => {
      showError(root, error);
    });
  }

  /**
   * Load data from GitHub CDN with local fallback
   */
  async function loadData(profilesFilter) {
    const config = window.fidesInteropMatrix || {};
    
    try {
      // Try GitHub CDN first
      const response = await fetch(config.githubDataUrl);
      if (!response.ok) throw new Error('GitHub fetch failed');
      
      const data = await response.json();
      return filterProfiles(data, profilesFilter);
    } catch (error) {
      console.warn('GitHub CDN failed, trying local fallback...', error);
      
      try {
        // Fallback to local data
        const response = await fetch(config.dataUrl);
        if (!response.ok) throw new Error('Local fetch failed');
        
        const data = await response.json();
        return filterProfiles(data, profilesFilter);
      } catch (fallbackError) {
        throw new Error('Failed to load profile data from both GitHub and local source');
      }
    }
  }

  /**
   * Filter profiles based on shortcode attribute
   */
  function filterProfiles(data, profilesFilter) {
    if (!profilesFilter) return data;

    const filterIds = profilesFilter.split(',').map(id => id.trim());
    const filteredProfiles = data.profiles.filter(p => 
      filterIds.includes(p.profile.id)
    );

    return {
      ...data,
      profiles: filteredProfiles,
      statistics: {
        ...data.statistics,
        totalProfiles: filteredProfiles.length
      }
    };
  }

  /**
   * Render the complete matrix view
   */
  function render(root, data, theme) {
    if (!data.profiles || data.profiles.length === 0) {
      root.innerHTML = '<div class="fides-empty"><p>No interop profiles found.</p></div>';
      return;
    }

    // Initialize selected profiles from localStorage or defaults
    selectedProfiles = getSelectedProfiles(data.profiles);

    // Filter profiles for desktop display
    const displayProfiles = filterProfilesBySelection(data.profiles, selectedProfiles);

    root.innerHTML = `
      <div class="fides-interop-container">
        ${renderDesktopMatrix(displayProfiles, data.profiles)}
        ${renderMobileView(data.profiles)}
      </div>
    `;

    // Initialize event listeners
    initTooltips(root);
    initToggle(root, displayProfiles);
    initProfileSelector(root, data.profiles);
  }

  /**
   * Get selected profiles from localStorage or use defaults
   */
  function getSelectedProfiles(availableProfiles) {
    const stored = localStorage.getItem('fides-interop-selected-profiles');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate that stored profiles exist in available profiles
        const validProfiles = parsed.filter(id => 
          availableProfiles.some(p => p.profile.id === id)
        );
        
        if (validProfiles.length > 0) {
          return validProfiles.slice(0, MAX_SELECTED_PROFILES);
        }
      } catch (e) {
        console.warn('Failed to parse stored profile selection', e);
      }
    }
    
    // Default: select DIIP v5 and HAIP v1 (skip DIIP v4)
    // This gives a good comparison of the two main stable versions
    const defaultIds = ['diip-v5', 'haip-v1'];
    const defaults = availableProfiles
      .filter(p => defaultIds.includes(p.profile.id))
      .map(p => p.profile.id);
    
    // If those don't exist, fall back to first 2 profiles
    if (defaults.length === 0) {
      return availableProfiles
        .slice(0, 2)
        .map(p => p.profile.id);
    }
    
    return defaults;
  }

  /**
   * Save selected profiles to localStorage
   */
  function setSelectedProfiles(profileIds) {
    try {
      localStorage.setItem('fides-interop-selected-profiles', JSON.stringify(profileIds));
      selectedProfiles = profileIds;
    } catch (e) {
      console.warn('Failed to save profile selection', e);
    }
  }

  /**
   * Filter profiles by selection
   */
  function filterProfilesBySelection(profiles, selectedIds) {
    return profiles.filter(p => selectedIds.includes(p.profile.id));
  }

  /**
   * Get catalog URL with profile ID replaced
   */
  function getCatalogUrl(urlTemplate, profileId) {
    return urlTemplate.replace('{profile}', profileId);
  }

  /**
   * Render desktop matrix view with sections
   */
  function renderDesktopMatrix(profiles, allProfiles) {
    const config = window.fidesInteropMatrix || {};
    const catalogUrls = config.catalogUrls || {};
    
    // Main profile headers at the top
    const mainProfileHeaders = profiles.map(p => `
      <th class="fides-matrix-profile-header">
        <div class="fides-profile-header-content">
          <strong class="fides-profile-name">${escapeHtml(p.profile.shortName || p.profile.name + ' ' + p.profile.version)}</strong>
        </div>
        <div class="fides-profile-links">
          ${p.profile.specUrl ? `
          <a href="${escapeHtml(p.profile.specUrl)}" target="_blank" rel="noopener" class="fides-profile-link" title="View Interop Profile Details">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </a>` : ''}
          ${catalogUrls.personalWallets ? `
          <a href="${escapeHtml(getCatalogUrl(catalogUrls.personalWallets, p.profile.id))}" target="_blank" rel="noopener" class="fides-profile-link" title="Show compliant Personal Wallets">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>` : ''}
          ${catalogUrls.businessWallets ? `
          <a href="${escapeHtml(getCatalogUrl(catalogUrls.businessWallets, p.profile.id))}" target="_blank" rel="noopener" class="fides-profile-link" title="Show compliant Business Wallets">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <rect x="8" y="6" width="2" height="2"></rect>
              <rect x="14" y="6" width="2" height="2"></rect>
              <rect x="8" y="11" width="2" height="2"></rect>
              <rect x="14" y="11" width="2" height="2"></rect>
              <rect x="8" y="16" width="2" height="2"></rect>
              <rect x="14" y="16" width="2" height="2"></rect>
            </svg>
          </a>` : ''}
          ${catalogUrls.relyingParties ? `
          <a href="${escapeHtml(getCatalogUrl(catalogUrls.relyingParties, p.profile.id))}" target="_blank" rel="noopener" class="fides-profile-link" title="Show compliant Relying Party Websites">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </a>` : ''}
        </div>
      </th>
    `).join('');

    const sections = CAPABILITY_GROUPS.map(group => {
      const profileNameCells = profiles.map(p => 
        `<th class="fides-section-profile-header">${escapeHtml(p.profile.shortName || p.profile.name + ' ' + p.profile.version)}</th>`
      ).join('');

      const rows = group.items.map(item => {
        // Check if all profiles have this capability unsupported
        const allNotSupported = profiles.every(profile => {
          const capability = profile.capabilities[group.key]?.[item.key];
          return !capability || !capability.supported;
        });

        const cells = profiles.map(profile => {
          const capability = profile.capabilities[group.key]?.[item.key];
          return renderCapabilityCell(capability, item.hasVersion);
        }).join('');

        const hideClass = allNotSupported ? 'fides-row-all-unsupported' : '';
        const hideStyle = (hideEmptyRows && allNotSupported) ? 'display: none;' : '';

        return `
          <tr class="fides-matrix-row ${hideClass}" style="${hideStyle}">
            <td class="fides-matrix-capability-name">${escapeHtml(item.label)}</td>
            ${cells}
          </tr>
        `;
      }).join('');

      return `
        <div class="fides-matrix-section">
          <table class="fides-matrix-table">
            <thead>
              <tr class="fides-section-header-row">
                <th class="fides-section-title-cell">${escapeHtml(group.label)}</th>
                ${profileNameCells}
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }).join('');

    return `
      <div class="fides-matrix-desktop">
        <div class="fides-matrix-controls">
          ${renderProfileSelector(allProfiles)}
          <div class="fides-view-toggle" role="group" aria-label="Row visibility controls">
            <button 
              type="button" 
              class="fides-view-btn ${hideEmptyRows ? '' : 'active'}" 
              data-view="all" 
              aria-label="Show all rows"
              aria-pressed="${!hideEmptyRows}"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </button>
            <button 
              type="button" 
              class="fides-view-btn ${hideEmptyRows ? 'active' : ''}" 
              data-view="supported" 
              aria-label="Hide unsupported rows"
              aria-pressed="${hideEmptyRows}"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </button>
          </div>
        </div>
        <div class="fides-matrix-main-header">
          <table class="fides-matrix-table">
            <thead>
              <tr>
                <th class="fides-matrix-empty-cell"></th>
                ${mainProfileHeaders}
              </tr>
            </thead>
          </table>
        </div>
        ${sections}
      </div>
    `;
  }

  /**
   * Render capability cell
   */
  function renderCapabilityCell(capability, hasVersion) {
    if (!capability) {
      return '<td class="fides-matrix-cell fides-cell-unknown">?</td>';
    }

    const supported = capability.supported;
    const hasNote = !!capability.note;
    const version = hasVersion && capability.version ? capability.version : '';

    let content, className;
    if (supported) {
      const versionText = version ? ` ${escapeHtml(version)}` : '';
      content = `<span class="fides-cell-icon fides-icon-check">✓</span>${versionText}`;
      className = 'fides-cell-supported';
    } else {
      content = '<span class="fides-cell-icon fides-icon-cross">✗</span>';
      className = 'fides-cell-not-supported';
    }

    if (hasNote) {
      className += ' fides-cell-has-note';
      content += ' <span class="fides-cell-note-indicator">⚠</span>';
    }

    const noteAttr = hasNote ? `data-note="${escapeHtml(capability.note)}"` : '';

    return `
      <td class="fides-matrix-cell ${className}" ${noteAttr}>
        ${content}
      </td>
    `;
  }

  /**
   * Render mobile view
   */
  function renderMobileView(profiles) {
    const profileTabs = profiles.map((p, idx) => `
      <button 
        class="fides-mobile-tab ${idx === 0 ? 'active' : ''}" 
        data-index="${idx}"
        type="button"
      >
        ${escapeHtml(p.profile.shortName || p.profile.name + ' ' + p.profile.version)}
      </button>
    `).join('');

    const profilePanels = profiles.map((p, idx) => `
      <div 
        class="fides-mobile-panel ${idx === 0 ? 'active' : ''}" 
        data-index="${idx}"
        role="tabpanel"
        aria-labelledby="fides-mobile-tab-${idx}"
        id="fides-mobile-panel-${idx}"
      >
        ${renderMobileProfile(p)}
      </div>
    `).join('');

    return `
      <div class="fides-matrix-mobile">
        <div class="fides-mobile-tabs">
          ${profileTabs}
        </div>
        <div class="fides-mobile-panels">
          ${profilePanels}
        </div>
      </div>
    `;
  }

  /**
   * Render single profile view for mobile
   */
  function renderMobileProfile(profile) {
    const sections = CAPABILITY_GROUPS.map(group => {
      const items = group.items.map(item => {
        const capability = profile.capabilities[group.key]?.[item.key];
        return renderMobileCapability(item.label, capability, item.hasVersion);
      }).join('');

      return `
        <div class="fides-mobile-section">
          <h3 class="fides-mobile-section-title">${escapeHtml(group.label)}</h3>
          <div class="fides-mobile-capabilities">
            ${items}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="fides-mobile-profile-header">
        <h3>
          ${escapeHtml(profile.profile.shortName || profile.profile.name + ' ' + profile.profile.version)}${profile.profile.specUrl ? `<a href="${escapeHtml(profile.profile.specUrl)}" target="_blank" rel="noopener" class="fides-mobile-spec-link" title="View specification">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>` : ''}
        </h3>
      </div>
      ${sections}
    `;
  }

  /**
   * Render single capability row for mobile
   */
  function renderMobileCapability(label, capability, hasVersion) {
    if (!capability) {
      return `
        <div class="fides-mobile-capability">
          <span class="fides-mobile-cap-label">${escapeHtml(label)}</span>
          <span class="fides-mobile-cap-value fides-cell-unknown">Unknown</span>
        </div>
      `;
    }

    const supported = capability.supported;
    const hasNote = !!capability.note;
    const version = hasVersion && capability.version ? capability.version : '';

    let icon, className;
    if (supported) {
      icon = '✓';
      className = 'fides-cell-supported';
    } else {
      icon = '✗';
      className = 'fides-cell-not-supported';
    }

    if (hasNote) {
      className += ' fides-cell-has-note';
    }

    const versionText = version ? ` ${version}` : '';
    const noteIndicator = hasNote ? ' ⚠' : '';
    const noteAttr = hasNote ? `data-note="${escapeHtml(capability.note)}"` : '';

    return `
      <div class="fides-mobile-capability" ${noteAttr}>
        <span class="fides-mobile-cap-label">${escapeHtml(label)}</span>
        <span class="fides-mobile-cap-value ${className}">
          ${icon}${versionText}${noteIndicator}
        </span>
      </div>
    `;
  }

  /**
   * Initialize tooltips for note indicators
   */
  function initTooltips(root) {
    const cells = root.querySelectorAll('[data-note]');
    
    cells.forEach(cell => {
      cell.addEventListener('mouseenter', showTooltip);
      cell.addEventListener('mouseleave', hideTooltip);
      cell.addEventListener('click', toggleTooltipMobile);
    });

    // Mobile tab switching
    const tabs = root.querySelectorAll('.fides-mobile-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const index = parseInt(tab.dataset.index);
        switchMobileTab(root, index);
      });
    });
  }

  /**
   * Show tooltip on hover
   */
  function showTooltip(event) {
    const note = event.currentTarget.dataset.note;
    if (!note) return;

    // Remove existing tooltip
    hideTooltip();

    const tooltip = document.createElement('div');
    tooltip.className = 'fides-tooltip';
    tooltip.textContent = note;
    document.body.appendChild(tooltip);

    const rect = event.currentTarget.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

    // Adjust if off-screen
    if (tooltip.offsetLeft < 0) {
      tooltip.style.left = '8px';
    }
    if (tooltip.offsetLeft + tooltip.offsetWidth > window.innerWidth) {
      tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 8) + 'px';
    }

    setTimeout(() => tooltip.classList.add('visible'), 10);
  }

  /**
   * Hide tooltip
   */
  function hideTooltip() {
    const tooltip = document.querySelector('.fides-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  /**
   * Toggle tooltip on mobile
   */
  function toggleTooltipMobile(event) {
    if (window.innerWidth > 768) return; // Desktop uses hover
    
    event.stopPropagation();
    const existingTooltip = document.querySelector('.fides-tooltip');
    
    if (existingTooltip) {
      hideTooltip();
    } else {
      showTooltip(event);
    }
  }

  /**
   * Switch mobile tab
   */
  function switchMobileTab(root, index) {
    currentMobileProfileIndex = index;

    const tabs = root.querySelectorAll('.fides-mobile-tab');
    const panels = root.querySelectorAll('.fides-mobile-panel');

    tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach((panel, i) => {
      panel.classList.toggle('active', i === index);
    });
  }

  /**
   * Initialize mobile swipe gestures
   */
  function initMobileGestures(root) {
    const panelsContainer = root.querySelector('.fides-mobile-panels');
    if (!panelsContainer) return;

    let touchStartX = 0;
    let touchEndX = 0;

    panelsContainer.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    panelsContainer.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe(root);
    }, { passive: true });

    function handleSwipe(root) {
      const diff = touchStartX - touchEndX;
      const threshold = 50;

      if (Math.abs(diff) < threshold) return;

      const profileCount = currentData?.profiles?.length || 0;
      
      if (diff > 0 && currentMobileProfileIndex < profileCount - 1) {
        // Swipe left - next profile
        switchMobileTab(root, currentMobileProfileIndex + 1);
      } else if (diff < 0 && currentMobileProfileIndex > 0) {
        // Swipe right - previous profile
        switchMobileTab(root, currentMobileProfileIndex - 1);
      }
    }
  }

  /**
   * Render profile selector
   */
  function renderProfileSelector(profiles) {
    const checkboxes = profiles.map(p => {
      const isSelected = selectedProfiles.includes(p.profile.id);
      const profileName = p.profile.shortName || `${p.profile.name} ${p.profile.version}`;
      
      return `
        <label class="fides-profile-checkbox">
          <input 
            type="checkbox" 
            value="${escapeHtml(p.profile.id)}"
            ${isSelected ? 'checked' : ''}
            data-profile-checkbox
          />
          <span class="fides-profile-checkbox-label">${escapeHtml(profileName)}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="fides-profile-selector">
        <div class="fides-profile-selector-header">
          <span class="fides-selector-title">Compare Profiles</span>
          <span class="fides-selector-count">${selectedProfiles.length}/${MAX_SELECTED_PROFILES} selected</span>
        </div>
        <div class="fides-profile-selector-content">
          <div class="fides-profile-checkbox-group">
            ${checkboxes}
          </div>
          <div class="fides-selector-actions">
            <button type="button" class="fides-selector-btn" data-action="reset">Reset</button>
            <button type="button" class="fides-selector-btn" data-action="select-all">Select All</button>
          </div>
        </div>
        <div class="fides-selector-warning" style="display: none;">
          Select up to ${MAX_SELECTED_PROFILES} profiles to compare
        </div>
      </div>
    `;
  }

  /**
   * Initialize profile selector event handlers
   */
  function initProfileSelector(root, allProfiles) {
    const checkboxes = root.querySelectorAll('[data-profile-checkbox]');
    const warningEl = root.querySelector('.fides-selector-warning');
    const countEl = root.querySelector('.fides-selector-count');
    const resetBtn = root.querySelector('[data-action="reset"]');
    const selectAllBtn = root.querySelector('[data-action="select-all"]');

    if (!checkboxes.length) return;

    // Checkbox change handler
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const profileId = checkbox.value;
        let newSelection = [...selectedProfiles];

        if (checkbox.checked) {
          if (newSelection.length >= MAX_SELECTED_PROFILES) {
            checkbox.checked = false;
            showWarning(warningEl);
            return;
          }
          newSelection.push(profileId);
        } else {
          newSelection = newSelection.filter(id => id !== profileId);
          
          // Require at least 1 profile
          if (newSelection.length === 0) {
            checkbox.checked = true;
            return;
          }
        }

        // Save and re-render
        setSelectedProfiles(newSelection);
        updateMatrixDisplay(root, allProfiles);
      });
    });

    // Reset button - reset to default selection (DIIP v5 and HAIP v1)
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const defaultIds = ['diip-v5', 'haip-v1'];
        const defaultSelection = allProfiles
          .filter(p => defaultIds.includes(p.profile.id))
          .map(p => p.profile.id);
        
        // If defaults don't exist, use first 2
        const finalSelection = defaultSelection.length > 0 
          ? defaultSelection 
          : allProfiles.slice(0, 2).map(p => p.profile.id);
        
        setSelectedProfiles(finalSelection);
        updateMatrixDisplay(root, allProfiles);
      });
    }

    // Select all button - select first 3 profiles
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const allIds = allProfiles
          .slice(0, MAX_SELECTED_PROFILES)
          .map(p => p.profile.id);
        setSelectedProfiles(allIds);
        updateMatrixDisplay(root, allProfiles);
      });
    }
  }

  /**
   * Show warning message temporarily
   */
  function showWarning(warningEl) {
    if (!warningEl) return;
    warningEl.style.display = 'block';
    setTimeout(() => {
      warningEl.style.display = 'none';
    }, 3000);
  }

  /**
   * Update matrix display after selection change
   */
  function updateMatrixDisplay(root, allProfiles) {
    const displayProfiles = filterProfilesBySelection(allProfiles, selectedProfiles);
    
    // Re-render desktop matrix
    const desktopContainer = root.querySelector('.fides-matrix-desktop');
    if (desktopContainer) {
      desktopContainer.outerHTML = renderDesktopMatrix(displayProfiles, allProfiles);
      
      // Re-initialize event listeners
      initTooltips(root);
      initToggle(root, displayProfiles);
      initProfileSelector(root, allProfiles);
    }
  }

  /**
   * Initialize view toggle control
   */
  function initToggle(root, profiles) {
    const viewBtns = root.querySelectorAll('.fides-view-btn');
    if (viewBtns.length === 0) return;

    viewBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = btn.dataset.view;
        hideEmptyRows = view === 'supported';
        localStorage.setItem('fides-interop-hide-empty', hideEmptyRows);

        // Update button states and ARIA attributes
        viewBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Toggle visibility of empty rows
        const emptyRows = root.querySelectorAll('.fides-row-all-unsupported');
        emptyRows.forEach(row => {
          row.style.display = hideEmptyRows ? 'none' : '';
        });
      });
    });
  }

  /**
   * Display error message
   */
  function showError(root, error) {
    root.innerHTML = `
      <div class="fides-error">
        <h3>Failed to load profiles</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Close tooltips on scroll or click outside
  document.addEventListener('scroll', hideTooltip, { passive: true });
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-note]')) {
      hideTooltip();
    }
  });

})();
