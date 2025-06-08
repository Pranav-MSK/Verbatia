import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Theme toggle: Dark / Light mode
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById('theme-toggle');
  const body = document.body;
  const savedTheme = localStorage.getItem('theme');

  // Apply saved theme on load
  if (savedTheme === 'dark') {
    body.classList.add('dark');
    if (toggle) toggle.checked = true;
  }

  // Toggle on switch
  if (toggle) {
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }
});

// Use the same Firebase config as app.js
const firebaseConfig = {
  apiKey: "AIzaSyBaRgQhYQfQYD88GA4B2oN0hZtnI4UypZ4",
  authDomain: "realtimechatapp-d92ab.firebaseapp.com",
  projectId: "realtimechatapp-d92ab",
  storageBucket: "realtimechatapp-d92ab.firebasestorage.app",
  messagingSenderId: "213050588169",
  appId: "1:213050588169:web:e9e2f5f88bb7472082ccd8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set auth persistence to local (optional but recommended)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("message-input");

let currentUserUid = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    // Not logged in, redirect to login
    window.location.href = "index.html";
    return;
  }

  currentUserUid = user.uid;

  // Listen to messages collection, ordered by timestamp
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  onSnapshot(q, (snapshot) => {
    chatWindow.innerHTML = ""; // Clear chat window
    let lastDate="";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const createdAt = msg.createdAt?.toDate?.();
      if (!createdAt) return;

      const messageDate = createdAt.toDateString();
      const timeString = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Insert date divider if date changes
      if (messageDate !== lastDate) {
        const dateDivider = document.createElement("div");
        dateDivider.className = "date-divider";
        dateDivider.textContent = messageDate;
        chatWindow.appendChild(dateDivider);
        lastDate = messageDate;
      }

      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message-bubble");

      if (msg.uid === currentUserUid) {
        msgDiv.classList.add("sent");
      } else {
        msgDiv.classList.add("received");
      }

      const username = msg.displayName || msg.userEmail || "Anonymous";

      msgDiv.innerHTML = `
        <div class="msg-username">${username}</div>
        <div class="msg-text">${msg.text}</div>
        <div class="msg-timestamp">${timeString}</div>
      `;

      chatWindow.appendChild(msgDiv);
      });
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto scroll to bottom
  });
});

// Send message function
window.sendMessage = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in");

  const text = messageInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    text,
    uid: user.uid,
    displayName: user.displayName || null,
    userEmail: user.email,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
};

// Logout function
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
