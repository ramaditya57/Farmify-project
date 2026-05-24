// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Fetch Firebase configuration dynamically from the backend
const firebaseConfig = await fetch('/api/firebase-config').then(res => res.json());

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const signupBtn = document.getElementById("signup-btn");

if (!signupBtn) {
    console.error("❌ signup-btn not found in DOM!");
} else {
    signupBtn.addEventListener("click", function () {
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        if (email === "" || password === "") {
            alert("Please fill in both fields.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("✅ Sign-up successful! Redirecting to login...");
                window.location.href = "/"; 
            })
            .catch((error) => {
                console.error("Firebase Auth Error:", error);
                alert("❌ Error: " + error.message);
            });
    });
}
