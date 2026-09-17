/**
 * Foldable block (<details>) Copy Button
 * Automatically adds a right-aligned copy button to <summary> inside <details> blocks.
 */
(function () {
  'use strict';

  var COPY_ICON = '<svg class="copy-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var CHECK_ICON = '<svg class="check-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function getPageLang() {
    var alt = document.getElementById('lang-alt');
    if (alt && alt.getAttribute('data-page-lang')) {
      return alt.getAttribute('data-page-lang');
    }
    var htmlLang = document.documentElement.getAttribute('lang') || '';
    if (htmlLang.toLowerCase().startsWith('ko')) {
      return 'ko';
    }
    if (window.location.pathname.indexOf('/ko/') !== -1) {
      return 'ko';
    }
    return 'en';
  }

  function getCopyText(details) {
    var codeEls = details.querySelectorAll('pre code, pre');
    if (codeEls.length > 0) {
      var parts = [];
      codeEls.forEach(function (el) {
        // Avoid duplicate match if <pre> contains <code>
        if (el.tagName.toLowerCase() === 'pre' && el.querySelector('code')) return;
        var text = el.textContent || '';
        parts.push(text.replace(/\s+$/, ''));
      });
      if (parts.length > 0) {
        return parts.join('\n\n');
      }
    }
    // Fallback: copy details text content excluding the summary element
    var clone = details.cloneNode(true);
    var s = clone.querySelector('summary');
    if (s) s.remove();
    return (clone.innerText || clone.textContent || '').trim();
  }

  function copyToClipboard(text, callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        callback(true);
      }).catch(function () {
        fallbackCopy(text, callback);
      });
    } else {
      fallbackCopy(text, callback);
    }
  }

  function fallbackCopy(text, callback) {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      var successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      callback(successful);
    } catch (err) {
      callback(false);
    }
  }

  function initDetailsCopy() {
    var isKo = getPageLang() === 'ko';
    var defaultLabel = isKo ? '복사' : 'Copy';
    var copiedLabel = isKo ? '복사됨!' : 'Copied!';
    var defaultTitle = isKo ? '코드 복사' : 'Copy code';

    var detailsList = document.querySelectorAll('details');
    detailsList.forEach(function (details) {
      var summary = details.querySelector('summary');
      if (!summary) return;
      if (summary.querySelector('.details-copy-btn')) return;

      // Wrap original summary content into a .summary-title container
      if (!summary.querySelector('.summary-title')) {
        var titleSpan = document.createElement('span');
        titleSpan.className = 'summary-title';
        while (summary.firstChild) {
          titleSpan.appendChild(summary.firstChild);
        }
        summary.appendChild(titleSpan);
      }

      // Create copy button
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'details-copy-btn';
      btn.title = defaultTitle;
      btn.setAttribute('aria-label', defaultTitle);

      var iconWrapper = document.createElement('span');
      iconWrapper.className = 'copy-icon-wrapper';
      iconWrapper.innerHTML = COPY_ICON;

      var textSpan = document.createElement('span');
      textSpan.className = 'copy-text';
      textSpan.textContent = defaultLabel;

      btn.appendChild(iconWrapper);
      btn.appendChild(textSpan);

      btn.addEventListener('click', function (e) {
        // Prevent details fold/unfold on button click
        e.preventDefault();
        e.stopPropagation();

        var text = getCopyText(details);
        copyToClipboard(text, function (success) {
          if (!success) return;

          btn.classList.add('copied');
          textSpan.textContent = copiedLabel;
          iconWrapper.innerHTML = CHECK_ICON;

          if (btn._resetTimer) {
            clearTimeout(btn._resetTimer);
          }

          btn._resetTimer = setTimeout(function () {
            btn.classList.remove('copied');
            textSpan.textContent = defaultLabel;
            iconWrapper.innerHTML = COPY_ICON;
            btn._resetTimer = null;
          }, 2000);
        });
      });

      summary.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetailsCopy);
  } else {
    initDetailsCopy();
  }
})();
