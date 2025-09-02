/**
 * Logo Display Manager
 * Handles showing/hiding logo placeholders based on image availability
 */

document.addEventListener('DOMContentLoaded', function() {
    // Logo elements to check
    const logoElements = [
        { img: '.main-logo', placeholder: '.logo-container .logo-placeholder:not(.small)' },
        { img: '.partner-img', placeholder: '.partner-logo .logo-placeholder' },
        { img: '.sponsor-img', placeholder: '.sponsor-logo .logo-placeholder' }
    ];

    logoElements.forEach(element => {
        const images = document.querySelectorAll(element.img);
        const placeholders = document.querySelectorAll(element.placeholder);
        
        images.forEach((img, index) => {
            const placeholder = placeholders[index];
            if (!placeholder) return;

            // Try to load the image
            img.onload = function() {
                // Image loaded successfully, hide placeholder and show image
                placeholder.style.display = 'none';
                img.style.display = 'block';
            };
            
            img.onerror = function() {
                // Image failed to load, keep placeholder visible
                placeholder.style.display = 'flex';
                img.style.display = 'none';
            };
            
            // Trigger the load check
            if (img.complete) {
                img.onload();
            }
        });
    });

    // Add smooth scroll behavior for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects for logo placeholders
    document.querySelectorAll('.logo-placeholder').forEach(placeholder => {
        placeholder.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        placeholder.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px) scale(1)';
        });
    });
});
