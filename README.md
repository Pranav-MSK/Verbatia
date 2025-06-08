
# 💬 Verbatia - Realtime Chat Application

Verbatia is a realtime web-based chat platform built with **JavaScript**, **Firebase Authentication**, and **Cloud Firestore**. It enables users to create accounts with custom display names, securely sign in, and communicate with others in a responsive, WhatsApp-style interface.

---

## 🔗 Live Demo

🌐 [Visit the Live App](https://realtimechatapp-d92ab.web.app) 

---

## 📸 Features

- ✅ Firebase Authentication (Signup, Login, Logout)
- ✅ Custom display name setup during signup
- ✅ Realtime chat with auto-updating messages via Firestore
- ✅ User-specific styling (messages aligned left/right)
- ✅ Responsive and aesthetic UI (inspired by WhatsApp/Instagram)
- ✅ Clean and intuitive message input and auto-scroll
- ✅ Secure session handling with local persistence

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Deploy CLI**: Firebase Tools

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/verbatia-app.git
cd verbatia-app
```

---

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
```

---

### 3. Login and initialize Firebase
```bash
firebase login
firebase use --add
```

---

### 4. Add your Firebase configuration

In both `public/app.js` and `public/chat.js`, replace the Firebase config block with your own project's configuration from the Firebase Console.

---

### 5. Serve locally
```bash
firebase emulators:start
```

OR for live preview

```bash
firebase serve
```

---

### 6. Deploy to Firebase
```bash
firebase deploy
```

---

## 📁 Project Structure

```bash
verbatia-app/
│
├── public/
│   ├── index.html         # Login & Signup UI
│   ├── chat.html          # Main Chat Interface
│   ├── style.css          # Custom styling and layout
│   ├── app.js             # Handles user auth and display name
│   └── chat.js            # Firestore realtime message logic
│
├── .firebaserc            # Firebase project settings
├── firebase.json          # Firebase hosting configuration
├── .gitignore             # Ignored files in version control
└── README.md              # This file
```

---

## 🔐 Firebase Firestore Rules

Make sure to use secure rules to restrict message reads/writes:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /messages/{message} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                    request.resource.data.userId == request.auth.uid;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🧠 Future Improvements

- 🔒 Private/group chat support
- 📎 File sharing (images, videos)
- 🟢 User online presence indicators
- 🧪 Emoji reactions & typing indicators
- 📬 Message notifications and delivery status

---

## ⚠️ Security Notes

- Do **NOT** upload `.env` or Firebase credentials to public repositories.
- All user data access is restricted via Firestore rules.

---

## 📧 Author

- **Name:** Pranav M S Krishnan  
- **GitHub:** [@Pranav-MSK](https://github.com/Pranav-MSK)  
- **Repo:** [verbatia-app](https://github.com/Pranav-MSK/Verbatia)  
- **Live Site:** [https://verbatia-app.web.app](https://realtimechatapp-d92ab.web.app/) 

---

### Made with ❤️ using Firebase
