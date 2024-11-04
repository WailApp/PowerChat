// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAzg4PmFoXnS95TXk8FlG9C4bSxhfer86E",
  authDomain: "wailai-a.firebaseapp.com",
  projectId: "wailai-a",
  storageBucket: "wailai-a.appspot.com",
  messagingSenderId: "857204915249",
  appId: "1:857204915249:web:0141c2e2e68ed96769e910",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const googleLoginButton = document.getElementById('google-login');
const messageField = document.getElementById('message-field');
const sendMessageButton = document.getElementById('send-message');
const chatContainer = document.getElementById('chat-container');
const typingStatus = document.getElementById('typing-status');

// Handle Google Login
googleLoginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(result => {
            loginScreen.classList.add('hidden');
            chatScreen.classList.remove('hidden');
            loadMessages();
        })
        .catch(error => console.error(error));
});

// Load messages from Firestore
function loadMessages() {
    db.collection('messages').orderBy('timestamp')
        .onSnapshot(snapshot => {
            chatContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.innerText = `${message.username}: ${message.text}`;
                chatContainer.appendChild(messageElement);
            });
        });
}

// Send a message
sendMessageButton.addEventListener('click', () => {
    const messageText = messageField.value;
    if (messageText.trim() !== "") {
        const user = auth.currentUser;
        db.collection('messages').add({
            text: messageText,
            username: user.displayName,
            avatar: user.photoURL || 'default-avatar.png',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageField.value = '';
    }
});

// Display typing status
messageField.addEventListener('input', () => {
    const user = auth.currentUser;
    db.collection('typingStatus').doc(user.uid).set({
        username: user.displayName,
        typing: messageField.value !== ""
    });

    setTimeout(() => {
        db.collection('typingStatus').doc(user.uid).set({
            typing: false
        });
    }, 3000);
});

// Listen for typing status updates
db.collection('typingStatus').onSnapshot(snapshot => {
    let typingUsers = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.typing) {
            typingUsers.push(data.username);
        }
    });

    typingStatus.innerText = typingUsers.length > 0 ? `${typingUsers.join(', ')} يكتب...` : '';
});
