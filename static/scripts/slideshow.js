document.addEventListener('DOMContentLoaded', function() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let slideInterval;

    // Function to show specific slide
    function showSlide(index) {
        // Remove active class from all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Add active class to the current slide
        slides[index].classList.add('active');
        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    // Function to go to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    // Auto advance slides every 5 seconds
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Stop auto-advance when user interacts with slideshow
    function pauseSlideShow() {
        clearInterval(slideInterval);
    }

    // Resume slideshow after pause
    function resumeSlideShow() {
        pauseSlideShow();
        startSlideShow();
    }

    // Event listeners for previous and next buttons
    document.querySelector('.prev').addEventListener('click', function() {
        prevSlide();
        resumeSlideShow();
    });

    document.querySelector('.next').addEventListener('click', function() {
        nextSlide();
        resumeSlideShow();
    });

    // Pause slideshow when hovering over slideshow
    document.querySelector('.slideshow-container').addEventListener('mouseenter', pauseSlideShow);
    document.querySelector('.slideshow-container').addEventListener('mouseleave', startSlideShow);

    // Start the slideshow
    startSlideShow();
    
    // Preload images for smoother transitions
    function preloadImages() {
        const imageUrls = [
            '/static/styles/assets/image1.jpg',
            '/static/styles/assets/image2.jpg',
            '/static/styles/assets/image3.jpg',
            '/static/styles/assets/image4.jpg'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }
    
    preloadImages();
});