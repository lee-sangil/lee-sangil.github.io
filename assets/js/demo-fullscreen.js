(function () {
  'use strict';
  if (window.DemoFullscreen) return;
  let active = null;

  const buttonStyle = document.createElement('style');
  buttonStyle.textContent = `
    #wrapper > #enterFullscreen, #wrapper > #leaveFullscreen,
    #solar-wrapper > #enterFullscreen, #solar-wrapper > #leaveFullscreen {
      z-index: 1000;
      pointer-events: auto;
      touch-action: manipulation;
    }
    #enterFullscreen > *, #leaveFullscreen > * { pointer-events: none; }
  `;
  document.head.append(buttonStyle);
  const guardedButtons = new WeakSet();
  const stopPropagation = event => event.stopPropagation();
  // Intercept canvas input before ancestor handlers, but preserve the button's click.
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel',
    'touchstart', 'touchmove', 'touchend', 'touchcancel',
    'mousedown', 'mousemove', 'mouseup', 'click'].forEach(type => {
    document.addEventListener(type, event => {
      const button = event.target instanceof Element &&
        event.target.closest('#enterFullscreen, #leaveFullscreen');
      if (!button || !button.parentElement.matches('#wrapper, #solar-wrapper')) return;
      if (type === 'click') {
        if (!guardedButtons.has(button)) {
          button.addEventListener('click', stopPropagation);
          guardedButtons.add(button);
        }
      } else event.stopPropagation();
    }, true);
  });

  function restoreStyle(element, style) {
    if (style === null) element.removeAttribute('style');
    else element.setAttribute('style', style);
  }

  function close() {
    if (!active) return;
    const state = active;
    active = null;
    state.observer.disconnect();
    window.removeEventListener('resize', state.update);
    if (window.visualViewport) {
      visualViewport.removeEventListener('resize', state.update);
      visualViewport.removeEventListener('scroll', state.update);
    }
    state.placeholder.replaceWith(state.wrapper);
    state.bottomEdge.remove();
    state.backdrop.remove();
    state.styles.forEach(([element, style]) => restoreStyle(element, style));
    // Restore immediately even if the page enables smooth anchor scrolling.
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(state.x, state.y);
    restoreStyle(document.documentElement, state.styles[0][1]);
    state.resize();
  }

  window.DemoFullscreen = {
    toggle(wrapper, on, resize) {
      if (!on) {
        if (active && active.wrapper === wrapper) close();
        return;
      }
      if (active && active.wrapper === wrapper) return;
      close();
      const root = document.documentElement;
      const body = document.body;
      const enter = wrapper.querySelector('#enterFullscreen');
      const leave = wrapper.querySelector('#leaveFullscreen');
      const placeholder = document.createElement('div');
      const rect = wrapper.getBoundingClientRect();
      placeholder.style.cssText = `width:${rect.width}px;height:${rect.height}px;`;
      const backdrop = document.createElement('div');
      backdrop.style.cssText = 'position:fixed;inset:0;width:100%;height:100vh;height:100lvh;background:#000;z-index:10000;overscroll-behavior:none;';
      const bottomEdge = document.createElement('div');
      // Let Safari extend black behind its controls while fullscreen is active.
      bottomEdge.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;height:max(8px, env(safe-area-inset-bottom));background:#000;pointer-events:none;z-index:10002;';
      const state = {
        wrapper, placeholder, backdrop, bottomEdge, resize, x: window.scrollX, y: window.scrollY,
        styles: [root, body, wrapper, enter, leave].map(element => [element, element.getAttribute('style')])
      };
      state.update = () => {
        if (active !== state) return;
        const viewport = window.visualViewport;
        Object.assign(wrapper.style, {
          top: `${viewport ? viewport.offsetTop : 0}px`,
          left: `${viewport ? viewport.offsetLeft : 0}px`,
          width: `${viewport ? viewport.width : window.innerWidth}px`,
          height: `${viewport ? viewport.height : window.innerHeight}px`
        });
        try { resize(); } catch (error) { close(); throw error; }
      };
      state.observer = new MutationObserver(() => {
        if (!wrapper.isConnected || !backdrop.isConnected || !bottomEdge.isConnected) close();
      });
      active = state;
      try {
        wrapper.replaceWith(placeholder);
        body.append(backdrop, wrapper, bottomEdge);
        // Keep the page's own colors intact so removing the overlay restores them.
        Object.assign(root.style, { overflow: 'hidden', overscrollBehavior: 'none' });
        Object.assign(body.style, {
          position: 'fixed', top: `${-state.y}px`, left: `${-state.x}px`,
          width: '100%', overflow: 'hidden', overscrollBehavior: 'none'
        });
        Object.assign(wrapper.style, {
          position: 'fixed', margin: '0', maxWidth: 'none', maxHeight: 'none',
          zIndex: '10001', backgroundColor: '#111', overflow: 'hidden',
          overscrollBehavior: 'contain', boxSizing: 'border-box',
          padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
        });
        enter.style.visibility = 'hidden';
        leave.style.visibility = 'visible';
        [enter, leave].forEach(button => {
          button.style.top = 'max(1vh, env(safe-area-inset-top))';
          button.style.left = 'max(1vw, env(safe-area-inset-left))';
        });
        window.addEventListener('resize', state.update);
        if (window.visualViewport) {
          visualViewport.addEventListener('resize', state.update);
          visualViewport.addEventListener('scroll', state.update);
        }
        state.observer.observe(body, { childList: true, subtree: true });
        state.update();
      } catch (error) {
        close();
        throw error;
      }
    }
  };
  window.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.addEventListener('pagehide', close);
}());
