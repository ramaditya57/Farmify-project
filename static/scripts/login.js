// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Fetch Firebase configuration dynamically from the backend
const firebaseConfig = await fetch('/api/firebase-config').then(res => res.json());

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check if user is already logged in, redirect accordingly
onAuthStateChanged(auth, (user) => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
        console.log("Skipping auto-redirect because logout query param is present.");
        return;
    }
    if (user) {
        console.log("✅ User already logged in:", user.email);
        const next = urlParams.get('next');
        if (next === 'chatbot') {
            window.location.href = `${firebaseConfig.chatbotUrl}/?email=${encodeURIComponent(user.email)}`;
        } else {
            window.location.href = "/mainsec";
        }
    }
});

// Check if logout parameter is present in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('logout') === 'true') {
    signOut(auth)
        .then(() => {
            console.log("✅ Successfully signed out via query param.");
            localStorage.clear();
            sessionStorage.clear();
            // Remove the query parameter from the URL bar
            window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((error) => {
            console.error("❌ Error signing out:", error);
        });
}

// Function to check if a file exists before redirecting
async function fileExists(url) {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch (error) {
        console.error("Error checking file:", error);
        return false;
    }
}

// Handle login with email/password
document.getElementById('submit').addEventListener("click", async function(event) {
    event.preventDefault();

    // Get user input
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === "" || password === "") {
        alert("Please fill in both email and password.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            alert("Login successful!");

            // Check if there's a next parameter
            const urlParams = new URLSearchParams(window.location.search);
            const next = urlParams.get('next');
            if (next === 'chatbot') {
                const user = userCredential.user;
                window.location.href = `${firebaseConfig.chatbotUrl}/?email=${encodeURIComponent(user.email)}`;
            } else if (await fileExists("/mainsec.html")) {
                window.location.href = "/mainsec.html";  // Direct file access
            } else {
                window.location.href = "/mainsec";  // Flask route
            }
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Handle login with Google
async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(async (result) => {
            alert("Google Login Successful!");

            const urlParams = new URLSearchParams(window.location.search);
            const next = urlParams.get('next');
            if (next === 'chatbot') {
                const user = result.user;
                window.location.href = `${firebaseConfig.chatbotUrl}/?email=${encodeURIComponent(user.email)}`;
            } else if (await fileExists("/mainsec.html")) {
                window.location.href = "/mainsec.html";  // Direct file access
            } else {
                window.location.href = "/mainsec";  // Flask route
            }
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Attach Google login function to window so it's accessible in HTML
window.loginWithGoogle = loginWithGoogle;
