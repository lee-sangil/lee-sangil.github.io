/**
 * Firebase 초기화 및 공용 모듈
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getDatabase, ref, get, runTransaction, onValue } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";

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
export const db = getDatabase(app);
export const analytics = getAnalytics(app);

// Firebase Database 함수들 re-export
export { ref, get, runTransaction, onValue };
