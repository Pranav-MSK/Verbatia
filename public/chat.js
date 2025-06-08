import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
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

// Use the same Firebase config as app.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("message-input");

// Check if user is logged in
onAuthStateChanged(auth, user => {
  if (!user) {
    // Not logged in, redirect to login
    window.location.href = "index.html";
    return;
  }
  // Listen to messages collection, ordered by timestamp
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  onSnapshot(q, (snapshot) => {
    chatWindow.innerHTML = ""; // Clear chat window
    snapshot.forEach(doc => {
      const msg = doc.data();
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `${msg.userEmail}: ${msg.text}`;
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
