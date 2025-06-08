import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

/* ─────────────────────────────────────────────────────────
   1.  Theme toggle  +  Enter-to-send  (one DOMContentLoaded)
───────────────────────────────────────────────────────────*/
document.addEventListener("DOMContentLoaded", () => {
  /* dark / light */
  const toggle = document.getElementById("theme-toggle");
  const body   = document.body;
  const saved  = localStorage.getItem("theme");
  if (saved === "dark") {
    body.classList.add("dark");
    toggle.checked = true;
  }
  toggle.addEventListener("change", () => {
    const isDark = toggle.checked;
    body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  /* Enter to send */
  const messageInput = document.getElementById("message-input");
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

/* ─────────────────────────────────────────────────────────
   2.  Firebase init
───────────────────────────────────────────────────────────*/
const firebaseConfig = {
  apiKey: "AIzaSyBaRgQhYQfQYD88GA4B2oN0hZtnI4UypZ4",
  authDomain: "realtimechatapp-d92ab.firebaseapp.com",
  projectId: "realtimechatapp-d92ab",
  storageBucket: "realtimechatapp-d92ab.firebasestorage.app",
  messagingSenderId: "213050588169",
  appId: "1:213050588169:web:e9e2f5f88bb7472082ccd8"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

/* DOM refs */
const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("message-input");
const onlineListEl = document.getElementById("online-list");

let currentUserUid = null;
let onlineRef      = null;

async function startPresence(user) {
  console.log("✅ startPresence called for", user.email);
  onlineRef = doc(db, "usersOnline", user.uid);

  const beat = () =>
    setDoc(
      onlineRef,
      {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous",
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

  beat();
  const heartbeatId = setInterval(beat, 30_000);

  window.addEventListener("beforeunload", () => {
    clearInterval(heartbeatId);
    deleteDoc(onlineRef).catch(() => {});
  });

  onSnapshot(collection(db, "usersOnline"), (snap) => {
    const now = Date.now();
    const FRESH_MS = 60_000;

    const names = Array.from(
      new Set(
        snap.docs
          .filter((d) => {
            const ts = d.data().lastSeen;
            return ts && now - (ts instanceof Timestamp ? ts.toMillis() : 0) < FRESH_MS;
          })
          .map((d) => d.data().displayName || "User")
      )
    );

    onlineListEl.innerHTML = names.length
      ? names.map((n) => `<li>${n}</li>`).join("")
      : "<li>(no one online)</li>";
  });
}

/* ─────────────────────────────────────────────────────────
   3.  Auth listener  +  online-users handling
───────────────────────────────────────────────────────────*/
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserUid = user.uid;
  startPresence(user);

  /* ---------- listen for messages ---------- */
  const q = query(collection(db, "messages"), orderBy("createdAt"));
  onSnapshot(q, (snapshot) => {
    chatWindow.innerHTML = "";
    let lastDate = "";

    snapshot.forEach((docSnap) => {
      const msg = docSnap.data();
      const createdAt = msg.createdAt?.toDate?.();
      if (!createdAt) return;

      const dateStr = createdAt.toDateString();
      const timeStr = createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      /* date divider */
      if (dateStr !== lastDate) {
        const divider = document.createElement("div");
        divider.className = "date-divider";
        divider.textContent = dateStr;
        chatWindow.appendChild(divider);
        lastDate = dateStr;
      }

      /* message bubble */
      const bubble = document.createElement("div");
      bubble.classList.add("message-bubble",
        msg.uid === currentUserUid ? "sent" : "received");

      bubble.innerHTML = `
        <div class="msg-username">${msg.displayName || msg.userEmail || "Anonymous"}</div>
        <div class="msg-text">${msg.text}</div>
        <div class="msg-timestamp">${timeStr}</div>
      `;
      if (msg.uid === currentUserUid) {
        const actions = document.createElement("div");
        actions.className = "msg-actions";

        actions.innerHTML = `
          <button onclick="editMessage('${docSnap.id}', '${msg.text.replace(/'/g, "\\'")}')">Edit</button>
          <button onclick="deleteMessage('${docSnap.id}')">Delete</button>
        `;
        if (msg.edited) {
          const editedNote = document.createElement("small");
          editedNote.style.fontSize = "11px";
          editedNote.textContent = "(edited)";
          bubble.appendChild(editedNote);
        }
        bubble.appendChild(actions);
      }
      chatWindow.appendChild(bubble);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
});

/* ─────────────────────────────────────────────────────────
   4.  Send-message + Edit-message + Delete-message + Logout
───────────────────────────────────────────────────────────*/

let lastSentTime = 0;
const MIN_SEND_INTERVAL_MS = 2000; // 2 seconds

window.sendMessage = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in");

  const text = messageInput.value.trim();
  if (!text) return;

  // rate-limiting
  const now = Date.now();
  if (now - lastSentTime < MIN_SEND_INTERVAL_MS) {
    alert("Please wait a moment before sending another message.");
    return;
  }

  if (text.length > 100) {
    alert("Messages can be max 100 characters long.");
    return;
  }

  lastSentTime = now;

  await addDoc(collection(db, "messages"), {
    text,
    uid: user.uid,
    displayName: user.displayName || null,
    userEmail: user.email,
    createdAt: serverTimestamp()
  });

  messageInput.value = "";
};

window.editMessage = async (id, oldText) => {
  const newText = prompt("Edit your message:", oldText);
  if (!newText || newText.trim() === "" || newText.length > 100) 
    return alert("Invalid message.");

  const messageRef = doc(db, "messages", id);
  await updateDoc(messageRef, {
    text: newText.trim(),
    edited: true,
    editedAt: serverTimestamp()
  });
};

window.deleteMessage = async (id) => {
  if (confirm("Delete this message?")) {
    await deleteDoc(doc(db, "messages", id));
  }
};



window.logout = () => {
  const user = auth.currentUser;
  if (user) deleteDoc(doc(db, "usersOnline", user.uid)).catch(()=>{});
  signOut(auth).then(() => (window.location.href = "index.html"));
};
