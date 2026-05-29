(function () {
  var LANG_KEY = 'site-lang';

  function getLang() {
    return localStorage.getItem(LANG_KEY);
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    if (tryRedirectPost(lang)) return;
    applyLang(lang);
    updatePagination(lang);
    updateLangUI(lang);
  }

  function updateLangUI(lang) {
    var enLink = document.getElementById('lang-en');
    var koLink = document.getElementById('lang-ko');
    if (enLink) enLink.style.fontWeight = lang === 'en' ? 'bold' : 'normal';
    if (koLink) koLink.style.fontWeight = lang === 'ko' ? 'bold' : 'normal';
  }

  function applyLang(lang) {
    var items = document.querySelectorAll('[data-lang-ref]');
    items.forEach(function (item) {
      var koUrl = item.getAttribute('data-ko-url');
      var koTitle = item.getAttribute('data-ko-title');
      if (!koUrl) return;

      var link = item.querySelector('.archive__item-title a[rel="permalink"]');
      if (!link) return;

      // Save original English data on first run
      if (!link.hasAttribute('data-en-url')) {
        link.setAttribute('data-en-url', link.getAttribute('href'));
        link.setAttribute('data-en-title', link.textContent);
      }

      var excerpt = item.querySelector('.archive__item-excerpt');
      if (excerpt && !excerpt.hasAttribute('data-en-excerpt')) {
        excerpt.setAttribute('data-en-excerpt', excerpt.textContent);
      }

      if (lang === 'ko') {
        link.setAttribute('href', koUrl);
        link.textContent = koTitle;
        if (excerpt && item.hasAttribute('data-ko-excerpt')) {
          excerpt.textContent = item.getAttribute('data-ko-excerpt');
        }
      } else {
        link.setAttribute('href', link.getAttribute('data-en-url'));
        link.textContent = link.getAttribute('data-en-title');
        if (excerpt && excerpt.hasAttribute('data-en-excerpt')) {
          excerpt.textContent = excerpt.getAttribute('data-en-excerpt');
        }
      }
    });
  }

  function updatePagination(lang) {
    var pagers = document.querySelectorAll('.pagination--pager[data-en-url]');
    pagers.forEach(function (pager) {
      var url = pager.getAttribute('data-' + lang + '-url') || pager.getAttribute('data-en-url');
      var title = pager.getAttribute('data-' + lang + '-title') || pager.getAttribute('data-en-title');
      pager.setAttribute('href', url);
      pager.setAttribute('title', title);
      var titleEl = pager.querySelector('.pagination--pager-title');
      if (titleEl) titleEl.textContent = title;
    });
  }

  function tryRedirectPost(lang) {
    var alt = document.getElementById('lang-alt');
    if (!alt) return false;
    var pageLang = alt.getAttribute('data-page-lang');
    var altUrl = alt.getAttribute('data-alt-lang-url');
    if (pageLang !== lang && altUrl) {
      window.location.href = altUrl;
      return true;
    }
    return false;
  }

  function detectLang(callback) {
    fetch('https://ipapi.co/country/')
      .then(function (res) { return res.text(); })
      .then(function (country) {
        callback(country.trim() === 'KR' ? 'ko' : 'en');
      })
      .catch(function () {
        var nav = navigator.language || navigator.userLanguage || 'en';
        callback(nav.startsWith('ko') ? 'ko' : 'en');
      });
  }

  function init() {
    var saved = getLang();
    if (saved) {
      if (tryRedirectPost(saved)) return;
      applyLang(saved);
      updatePagination(saved);
      updateLangUI(saved);
    } else {
      detectLang(function (lang) {
        localStorage.setItem(LANG_KEY, lang);
        if (tryRedirectPost(lang)) return;
        applyLang(lang);
        updatePagination(lang);
        updateLangUI(lang);
      });
    }
  }

  window.setLang = setLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
