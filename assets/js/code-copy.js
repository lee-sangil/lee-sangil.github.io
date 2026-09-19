/**
 * Code Block Copy Button
 * Automatically adds a copy button to code blocks.
 * - Mouse environments: appears on hover
 * - Touch environments: appears when code block is touched, fades out after a few seconds
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

  function getCodeText(block) {
    // If rouge table layout (with line numbers), extract only the code cell
    var codeTd = block.querySelector('td.code, td.rouge-code');
    if (codeTd) {
      return (codeTd.innerText || codeTd.textContent || '').replace(/\r\n/g, '\n').replace(/\s+$/, '');
    }
    var codeEl = block.querySelector('pre code, code');
    if (codeEl) {
      return (codeEl.innerText || codeEl.textContent || '').replace(/\r\n/g, '\n').replace(/\s+$/, '');
    }
    var preEl = block.querySelector('pre') || block;
    return (preEl.innerText || preEl.textContent || '').replace(/\r\n/g, '\n').replace(/\s+$/, '');
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

  var activeTouchBtn = null;
  var activeTouchTimer = null;

  function hideActiveTouchBtn() {
    if (activeTouchBtn) {
      activeTouchBtn.classList.remove('is-touch-active');
      activeTouchBtn = null;
    }
    if (activeTouchTimer) {
      clearTimeout(activeTouchTimer);
      activeTouchTimer = null;
    }
  }

  function initTouchListener() {
    // Listen for touch interactions on touch devices
    document.addEventListener('touchstart', function (e) {
      var block = e.target.closest('div.highlighter-rouge, figure.highlight, pre.code-copy-standalone');
      if (!block) {
        // Tapped outside any code block -> hide any active touch copy button
        hideActiveTouchBtn();
        return;
      }

      var btn = block.querySelector('.code-copy-btn');
      if (!btn) return;

      if (e.target.closest('.code-copy-btn')) {
        // Tapped the copy button itself: keep it visible while interacting
        if (activeTouchTimer) clearTimeout(activeTouchTimer);
        activeTouchTimer = setTimeout(function () {
          hideActiveTouchBtn();
        }, 3000);
        return;
      }

      // Tapped inside the code block
      if (activeTouchBtn && activeTouchBtn !== btn) {
        hideActiveTouchBtn();
      }

      btn.classList.add('is-touch-active');
      activeTouchBtn = btn;

      if (activeTouchTimer) clearTimeout(activeTouchTimer);
      activeTouchTimer = setTimeout(function () {
        hideActiveTouchBtn();
      }, 3500); // visible for 3.5 seconds
    }, { passive: true });
  }

  function initCodeCopy() {
    var isKo = getPageLang() === 'ko';
    var defaultLabel = isKo ? '복사' : 'Copy';
    var copiedLabel = isKo ? '복사됨!' : 'Copied!';
    var defaultTitle = isKo ? '코드 복사' : 'Copy code';

    // Find code containers
    var containers = document.querySelectorAll('div.highlighter-rouge, figure.highlight');
    var matchedPres = [];
    containers.forEach(function (container) {
      var pres = container.querySelectorAll('pre');
      pres.forEach(function (p) { matchedPres.push(p); });
    });

    var blocks = Array.prototype.slice.call(containers);

    // Also include standalone pre elements not wrapped in highlighter-rouge/highlight
    var allPres = document.querySelectorAll('pre');
    allPres.forEach(function (pre) {
      if (matchedPres.indexOf(pre) === -1 && !pre.closest('.highlighter-rouge, .highlight')) {
        pre.classList.add('code-copy-standalone');
        blocks.push(pre);
      }
    });

    blocks.forEach(function (block) {
      if (block.querySelector('.code-copy-btn')) return;

      // Create copy button
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy-btn';
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
        e.preventDefault();
        e.stopPropagation();

        var text = getCodeText(block);
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
            if (btn === activeTouchBtn) {
              hideActiveTouchBtn();
            }
          }, 2000);
        });
      });

      block.appendChild(btn);
    });

    initTouchListener();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopy);
  } else {
    initCodeCopy();
  }
})();
