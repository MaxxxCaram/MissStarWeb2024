// Handle responsive menu
document.addEventListener('DOMContentLoaded', () => {
    // Add JavaScript functionality as needed
    console.log('Website loaded successfully');
});

document.addEventListener('DOMContentLoaded', function() {
    // Find all elements with 'expandable-title' class
    const expandableTitles = document.querySelectorAll('.expandable-title');
    
    // Add click event to each expandable title
    expandableTitles.forEach(title => {
        title.addEventListener('click', function() {
            // Toggle 'active' class on title
            this.classList.toggle('active');
            
            // Get content associated with this title
            const content = this.nextElementSibling;
            
            // Toggle content visibility
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Initialize language to English by default
    let currentLanguage = 'en';

    // Function to change language
    function changeLanguage(lang) {
        currentLanguage = lang;
        
        // Get all elements with translation attributes
        const elements = document.querySelectorAll('[data-lang-es], [data-lang-en]');
        
        // Change text of each element based on selected language
        elements.forEach(el => {
            if (lang === 'es' && el.hasAttribute('data-lang-es')) {
                el.textContent = el.getAttribute('data-lang-es');
            } else if (lang === 'en' && el.hasAttribute('data-lang-en')) {
                el.textContent = el.getAttribute('data-lang-en');
            }
        });
    }

    // Add events to language buttons
    const langButtons = document.querySelectorAll('.language-switcher button');
    if (langButtons) {
        langButtons.forEach(button => {
            button.addEventListener('click', function() {
                changeLanguage(this.getAttribute('data-lang'));
                
                // Mark current button as active
                langButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});

// Scroll and Animation Controller
class ScrollController {
    constructor() {
        this.initializeObserver();
        this.initializeScrollDots();
    }

    initializeObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.updateScrollIndicator(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        // Observe all animated elements
        document.querySelectorAll('.section-title, .section-divider, .section-content')
            .forEach(el => this.observer.observe(el));
    }

    updateScrollIndicator(target) {
        const section = target.closest('section');
        if (!section) return;

        document.querySelectorAll('.scroll-dot').forEach(dot => {
            dot.classList.toggle('active', dot.dataset.section === section.id);
        });
    }

    initializeScrollDots() {
        document.querySelectorAll('.scroll-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const section = document.getElementById(dot.dataset.section);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
}

// Language Controller
class LanguageController {
    constructor() {
        this.currentLang = 'en';
        this.initializeLanguageButtons();
    }

    initializeLanguageButtons() {
        document.querySelectorAll('[data-lang]').forEach(button => {
            button.addEventListener('click', () => this.switchLanguage(button.dataset.lang));
        });
    }

    switchLanguage(lang) {
        if (this.currentLang === lang) return;

        document.querySelectorAll('[data-lang]').forEach(button => {
            const isSelected = button.dataset.lang === lang;
            button.classList.toggle('btn-primary', isSelected);
            button.classList.toggle('btn-secondary', !isSelected);
        });

        this.currentLang = lang;
        // Here we would trigger the translation logic
    }
}

// Video Controller
class VideoController {
    constructor() {
        this.video = document.querySelector('.hero-video');
        this.audioContext = null;
        if (this.video) {
            this.initializeVideo();
        }
    }

    initializeVideo() {
        // Create AudioContext only after user interaction
        const initAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initAudio);
        };
        document.addEventListener('click', initAudio);

        // Ensure video plays automatically and handles mobile devices
        this.video.play().catch(() => {
            // Handle autoplay failure (common on mobile)
            const playButton = this.createPlayButton();
            document.querySelector('.hero-section').appendChild(playButton);
        });

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.video.pause();
                if (this.audioContext) {
                    this.audioContext.suspend();
                }
            } else {
                this.video.play().catch(() => {});
                if (this.audioContext) {
                    this.audioContext.resume();
                }
            }
        });
    }

    createPlayButton() {
        const button = document.createElement('button');
        button.className = 'absolute z-20 btn-primary';
        button.innerHTML = '<i class="fas fa-play mr-2"></i>Play Video';
        button.addEventListener('click', () => {
            this.video.play();
            button.remove();
        });
        return button;
    }
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize performance observer
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    // Only log tasks that take more than 100ms
                    if (entry.duration > 100) {
                        console.warn('Long task detected:', entry);
                    }
                }
            });
            
            // Observe only paint metrics
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.warn('PerformanceObserver not fully supported:', e);
        }
    }

    new ScrollController();
    new LanguageController();
    new VideoController();
});