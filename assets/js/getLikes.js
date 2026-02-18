/**
 * Firebase에서 각 포스트의 좋아요 수를 불러와 .like-count[pathname] 요소에 표시.
 * id="like-count-0"인 요소는 firebase-config가 갱신하므로 제외.
 */
import { db, ref, get } from "/assets/js/firebase-init.js";

$(document).ready(function() {
  const elements = document.querySelectorAll('.like-count[pathname]');
  elements.forEach(function (el) {
    if (el.id === 'like-count-0') return;
    const path = el.getAttribute('pathname');
    if (!path) return;
    get(ref(db, `${path}/like`))
      .then(function (snapshot) {
        el.textContent = snapshot.val() !== null ? snapshot.val() : 0;
      })
      .catch(function () {
        el.textContent = 0;
      });
  });
});