document.addEventListener("DOMContentLoaded", function () {
    const loader = document.querySelector(".loader-container");
    if (!loader) return;
    
    // Show loader for 1.2s, then fade out smoothly
    setTimeout(() => {
        loader.classList.add("hidden");
        // Remove from DOM after transition
        setTimeout(() => {
            loader.style.display = "none";
        }, 600);
    }, 1200);
});
