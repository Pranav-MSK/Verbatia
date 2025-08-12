// Firebase imports via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "Enter API Key",
  authDomain: "realtimechatapp-d92ab.firebaseapp.com",
  projectId: "realtimechatapp-d92ab",
  storageBucket: "realtimechatapp-d92ab.firebasestorage.app",
  messagingSenderId: "213050588169",
  appId: "1:213050588169:web:e9e2f5f88bb7472082ccd8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set auth persistence to local (keep user logged in across tabs & sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set persistence:", error);
});

// Login function
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("status").textContent = "Login successful!";
    window.location.href = "chat.html";
  } catch (error) {
    document.getElementById("status").textContent = error.message;
  }
}

// Signup function
window.signup = async function () {
  const displayName = document.getElementById("displayName").value.trim();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!displayName) {
    document.getElementById("status").textContent = "Please enter a display name.";
    return;
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: displayName });
    document.getElementById("status").textContent = "Sign up successful! You can now login.";
  } catch (error) {
    document.getElementById("status").textContent = error.message;
  }
}
