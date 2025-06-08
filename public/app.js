// Firebase imports via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// ✅ Replace this config with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBaRgQhYQfQYD88GA4B2oN0hZtnI4UypZ4",
  authDomain: "realtimechatapp-d92ab.firebaseapp.com",
  projectId: "realtimechatapp-d92ab",
  storageBucket: "realtimechatapp-d92ab.firebasestorage.app",
  messagingSenderId: "213050588169",
  appId: "1:213050588169:web:e9e2f5f88bb7472082ccd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login function
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById("status").textContent = "Login successful!";
    // Redirect to chat page
    window.location.href = "chat.html";
  } catch (error) {
    document.getElementById("status").textContent = error.message;
  }
}


// Signup function
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    document.getElementById("status").textContent = "Sign up successful!";
  } catch (error) {
    document.getElementById("status").textContent = error.message;
  }
}
