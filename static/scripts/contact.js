// Import EmailJS SDK
// import * as emailjs from "https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js";

let emailjsConfig = null;

// Initialize EmailJS by fetching config dynamically
async function initializeEmailJS() {
    try {
        const response = await fetch('/api/emailjs-config');
        emailjsConfig = await response.json();
        emailjs.init(emailjsConfig.publicKey);
        console.log("✅ EmailJS initialized.");
    } catch (e) {
        console.error("❌ Failed to initialize EmailJS:", e);
    }
}
initializeEmailJS();

let stars = []

// Select all stars and initialize rating
document.addEventListener('DOMContentLoaded', function() {
    stars = document.querySelectorAll('.star');
    console.log(stars)
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.getAttribute('data-value')); 
            document.getElementById('rating').value = selectedRating; // Update hidden input

            // Reset all stars to gray
            stars.forEach(s => s.classList.remove('selected'));

            // Highlight selected stars
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.classList.add('selected');    
                }
            });
        });
    });
});

// Form Submission
document.getElementById('contactForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const rating = parseInt(document.getElementById('rating').value);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (name === "" || email === "" || message === "" || rating === 0) {
        alert("Please fill out all required fields, including the star rating.");
        return;
    }

    // Prepare email parameters
    const emailParams = {
        to_email:"farmify25@gmail.com",
        from_name: name,
        from_email: email,
        message: message,
        rating: rating
    };

    try {
        // Send email via EmailJS
        const serviceId = emailjsConfig ? emailjsConfig.serviceId : "service_06xujya";
        const templateId = emailjsConfig ? emailjsConfig.templateId : "template_w1qw0u7";
        const response = await emailjs.send(serviceId, templateId, emailParams);

        // Check if the email was sent successfully (response will contain the status)
        if (response.status === 200) {
            // If email is sent successfully
            document.getElementById('responseMessage').classList.remove('hidden');
            document.getElementById('contactForm').reset();
            selectedRating = 0;

            // Reset stars
            stars.forEach(s => s.classList.remove('text-yellow-500'));
            stars.forEach(s => s.classList.add('text-gray-400'));

            // Hide message after 3 seconds
            setTimeout(() => {
                // document.getElementById('responseMessage').style.display="block";
                alert("Thank you for your feedback!")
            }, 3000);
        } else {
            // If email sending failed (this shouldn't normally happen unless there's an issue)
            console.error("Error sending email. Response status:", response.status);
            alert("Something went wrong. Please try again later.");
        }
    } catch (error) {
        // If there's an error in the emailjs.send() function, show the alert
        console.error("Error sending email:", error);
        alert("Something went wrong. Please try again later.");
    }
});
