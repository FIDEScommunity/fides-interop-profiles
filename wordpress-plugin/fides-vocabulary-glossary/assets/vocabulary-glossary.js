/**
 * FIDES Vocabulary Glossary — alphabetical term browser with search and modal details.
 */
(function () {
  'use strict';

  const config = window.fidesVocabularyGlossary || {};
  const root = document.getElementById('fides-vocabulary-glossary-root');
  if (!root) return;

  const icons = {
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    xSmall: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  };

  let terms = [];
  let termById = {};
  let searchQuery = '';
  let activeLetter = '';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeSearch(value) {
    return String(value || '').trim().toLowerCase();
  }

  function buildIndexes(items) {
    termById = {};
    items.forEach(function (item) {
      if (item && item.id) termById[item.id] = item;
    });
  }

  function termMatchesQuery(term, query) {
    if (!query) return true;
    const haystack = [
      term.name,
      term.key,
      term.description,
    ]
      .concat(Array.isArray(term.aliases) ? term.aliases : [])
      .join(' ')
      .toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function filteredTerms() {
    const query = normalizeSearch(searchQuery);
    return terms.filter(function (term) {
      return termMatchesQuery(term, query);
    });
  }

  function groupByLetter(items) {
    const grouped = {};
    items.forEach(function (term) {
      const letter = term.letter && /^[A-Z#]$/.test(term.letter) ? term.letter : '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(term);
    });
    return Object.keys(grouped)
      .sort(function (a, b) {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
      })
      .map(function (letter) {
        return { letter: letter, items: grouped[letter] };
      });
  }

  function availableLetters(items) {
    const set = {};
    items.forEach(function (term) {
      const letter = term.letter && /^[A-Z#]$/.test(term.letter) ? term.letter : '#';
      set[letter] = true;
    });
    return Object.keys(set).sort(function (a, b) {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
  }

  function alphabetNavHtml(letters) {
    const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
    return (
      '<nav class="fides-glossary-alpha" aria-label="Jump to letter">' +
      all
        .map(function (letter) {
          const enabled = letters.indexOf(letter) !== -1;
          const active = activeLetter === letter ? ' is-active' : '';
          const disabled = enabled ? '' : ' is-disabled';
          return (
            '<button type="button" class="fides-glossary-alpha__btn' +
            active +
            disabled +
            '" data-letter="' +
            escapeHtml(letter) +
            '" ' +
            (enabled ? '' : 'disabled') +
            '>' +
            escapeHtml(letter === '#' ? '#' : letter) +
            '</button>'
          );
        })
        .join('') +
      '</nav>'
    );
  }

  function termListHtml(groups) {
    if (!groups.length) {
      return '<div class="fides-glossary-empty"><p>No terms match your search.</p></div>';
    }
    return groups
      .map(function (group) {
        return (
          '<section class="fides-glossary-letter" id="fides-glossary-letter-' +
          escapeHtml(group.letter) +
          '" data-letter="' +
          escapeHtml(group.letter) +
          '">' +
          '<h2 class="fides-glossary-letter__heading">' +
          escapeHtml(group.letter) +
          '</h2>' +
          '<ul class="fides-glossary-letter__list">' +
          group.items
            .map(function (term) {
              return (
                '<li><button type="button" class="fides-glossary-term" data-term-id="' +
                escapeHtml(term.id) +
                '">' +
                escapeHtml(term.name) +
                '</button></li>'
              );
            })
            .join('') +
          '</ul></section>'
        );
      })
      .join('');
  }

  function render() {
    const items = filteredTerms();
    const groups = groupByLetter(items);
    const letters = availableLetters(items);
    const countLabel =
      items.length === 1 ? '1 glossary term' : items.length + ' glossary terms';

    root.innerHTML =
      '<div class="fides-glossary">' +
      '<div class="fides-glossary-toolbar fides-results-bar">' +
      '<div class="fides-topbar-search">' +
      '<div class="fides-search-wrapper">' +
      '<span class="fides-search-icon">' +
      icons.search +
      '</span>' +
      '<input id="fides-glossary-search" class="fides-search-input" type="search" placeholder="Search glossary terms…" value="' +
      escapeHtml(searchQuery) +
      '" autocomplete="off" aria-label="Search glossary terms">' +
      '<button class="fides-search-clear' +
      (searchQuery ? '' : ' hidden') +
      '" id="fides-glossary-search-clear" type="button" aria-label="Clear search">' +
      icons.xSmall +
      '</button>' +
      '</div>' +
      '</div>' +
      '<p class="fides-results-count fides-glossary-count" aria-live="polite">' +
      escapeHtml(countLabel) +
      '</p>' +
      '</div>' +
      alphabetNavHtml(letters) +
      '<div class="fides-glossary-body">' +
      termListHtml(groups) +
      '</div>' +
      '</div>';

    bindUiEvents();
  }

  function modalOptions() {
    const ratingsLoginUrl = String(config.ratingsLoginUrl || config.loginUrl || '').trim();
    return {
      theme: root.getAttribute('data-theme') || 'fides',
      ratingsApiBase: config.ratingsApiBase || '',
      ratingsNonce: config.ratingsNonce || '',
      ratingsIsLoggedIn: config.isLoggedIn,
      isLoggedIn: config.isLoggedIn,
      loginUrl: ratingsLoginUrl,
      ratingsLoginUrl: ratingsLoginUrl,
      updateFormUrl: config.updateFormUrl || '',
    };
  }

  function openTermById(id, pushState) {
    const term = termById[id];
    if (!term || !window.FidesCatalogUI || typeof window.FidesCatalogUI.openVocabularyModal !== 'function') {
      return;
    }
    window.FidesCatalogUI.openVocabularyModal(term, modalOptions());
    if (pushState !== false) {
      const url = new URL(window.location.href);
      url.searchParams.set('term', term.id);
      window.history.replaceState({}, '', url.toString());
    }
  }

  function closeDeepLink() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('term')) return;
    url.searchParams.delete('term');
    window.history.replaceState({}, '', url.toString());
  }

  function bindUiEvents() {
    const searchInput = root.querySelector('#fides-glossary-search');
    const searchClear = root.querySelector('#fides-glossary-search-clear');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        searchQuery = searchInput.value;
        activeLetter = '';
        render();
        const nextInput = root.querySelector('#fides-glossary-search');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        searchQuery = '';
        activeLetter = '';
        render();
        const nextInput = root.querySelector('#fides-glossary-search');
        if (nextInput) nextInput.focus();
      });
    }

    root.querySelectorAll('.fides-glossary-term').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openTermById(btn.getAttribute('data-term-id'));
      });
    });

    root.querySelectorAll('.fides-glossary-alpha__btn:not(.is-disabled)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const letter = btn.getAttribute('data-letter');
        activeLetter = letter;
        const section = root.querySelector('#fides-glossary-letter-' + letter);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        root.querySelectorAll('.fides-glossary-alpha__btn').forEach(function (el) {
          el.classList.toggle('is-active', el.getAttribute('data-letter') === letter);
        });
      });
    });
  }

  function revealSsrFallback() {
    const ssrFallback = root.querySelector('[data-fides-ssr="vocabulary"]');
    if (ssrFallback) {
      ssrFallback.style.display = '';
      ssrFallback.removeAttribute('aria-hidden');
    }
    const spinner = root.querySelector('[data-fides-ssr-spinner="1"]');
    if (spinner) spinner.remove();
  }

  async function loadTerms() {
    const urls = [];
    if (config.githubDataUrl) urls.push(config.githubDataUrl);
    if (config.localDataUrl) urls.push(config.localDataUrl);

    for (let i = 0; i < urls.length; i += 1) {
      try {
        const url = urls[i];
        const bust =
          url.indexOf(config.localDataUrl) === 0 && config.aggregatedDataVersion
            ? (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + encodeURIComponent(config.aggregatedDataVersion)
            : '';
        const res = await fetch(url + bust, { credentials: 'omit' });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && Array.isArray(data.terms) && data.terms.length) {
          return data.terms;
        }
      } catch (e) {
        /* try next source */
      }
    }
    return [];
  }

  function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('term');
    if (id && termById[id]) {
      openTermById(id, false);
    }
  }

  document.addEventListener('fides-catalog-modal-closed', function () {
    closeDeepLink();
  });

  async function init() {
    terms = await loadTerms();
    if (!terms.length) {
      revealSsrFallback();
      handleDeepLink();
      return;
    }

    buildIndexes(terms);
    render();
    handleDeepLink();
  }

  init();
})();
