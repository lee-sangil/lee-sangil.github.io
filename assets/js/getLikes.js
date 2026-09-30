/**
 * Firebase에서 각 포스트의 좋아요 수를 불러와 .like-count[pathname] 요소에 표시.
 * id="like-count-0"인 요소는 firebase-config가 갱신하므로 제외.
 */
import { db, ref, get } from "/assets/js/firebase-init.js";

$(document).ready(function() {
  const byPath = new Map();
  document.querySelectorAll('.like-count[pathname]').forEach(function (el) {
    if (el.id === 'like-count-0') return;
    const path = el.getAttribute('pathname');
    if (!path) return;
    if (!byPath.has(path)) byPath.set(path, []);
    byPath.get(path).push(el);
  });

  const requested = new Set();
  let observer = null;
  function load(path) {
    if (requested.has(path)) return;
    requested.add(path);
    const elements = byPath.get(path);
    if (observer) elements.forEach(function (el) { observer.unobserve(el); });
    get(ref(db, `${path}/like`))
      .then(function (snapshot) {
        const count = snapshot.val() !== null ? snapshot.val() : 0;
        elements.forEach(function (el) { el.textContent = count; });
      })
      .catch(function () {
        elements.forEach(function (el) { el.textContent = 0; });
      });
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) load(entry.target.getAttribute('pathname'));
      });
    }, { rootMargin: '300px 0px' });
    byPath.forEach(function (elements) {
      elements.forEach(function (el) { observer.observe(el); });
    });
  } else {
    byPath.forEach(function (_, path) { load(path); });
  }
});
