/**
 * Firebase에서 각 포스트의 좋아요 수를 불러와 .like-count[pathname] 요소에 표시.
 * id="like-count-0"인 요소는 firebase-config가 갱신하므로 제외.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzTCUqQHpltS7GwxbFFwG-ZeXQn-t7TRI",
  authDomain: "my-tech-blog-138bf.firebaseapp.com",
  databaseURL: "https://my-tech-blog-138bf-default-rtdb.firebaseio.com",
  projectId: "my-tech-blog-138bf",
  storageBucket: "my-tech-blog-138bf.firebasestorage.app",
  messagingSenderId: "918377144391",
  appId: "1:918377144391:web:82b933cc0fe91390621162",
  measurementId: "G-FND0SQMRJW"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function loadLikeCounts() {
  const elements = document.querySelectorAll('.like-count[pathname]');
  elements.forEach(function (el) {
    if (el.id === 'like-count-0') return;
    const path = el.getAttribute('pathname');
    if (!path) return;
    get(ref(db, path))
      .then(function (snapshot) {
        el.textContent = snapshot.val() !== null ? snapshot.val() : 0;
      })
      .catch(function () {
        el.textContent = 0;
      });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadLikeCounts);
} else {
  loadLikeCounts();
}
