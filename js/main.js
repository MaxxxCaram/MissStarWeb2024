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
            this.handleVideoErrors();
        }
    }

    initializeVideo() {
        // Solo crear AudioContext después de interacción del usuario
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.audioContext.resume();
                } catch (e) {
                    console.warn('AudioContext no soportado:', e);
                }
            }
        }, { once: true });

        // Manejar reproducción de video
        if (this.video) {
            // Verificar si el video existe antes de reproducir
            const videoSource = this.video.querySelector('source');
            if (videoSource && videoSource.src) {
                this.video.play().catch(() => {
                    this.handleVideoError();
                });
            } else {
                this.handleVideoError();
            }
        }
    }

    handleVideoErrors() {
        if (!this.video) return;

        this.video.addEventListener('error', () => {
            this.handleVideoError();
        });

        // Verificar si el video falla en cargar
        const videoSource = this.video.querySelector('source');
        if (videoSource) {
            videoSource.addEventListener('error', () => {
                this.handleVideoError();
            });
        }
    }

    handleVideoError() {
        // Ocultar el video y mostrar un fondo de respaldo
        if (this.video) {
            this.video.style.display = 'none';
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.background = 'linear-gradient(to bottom, #000000, #1a1a1a)';
                heroSection.style.minHeight = '100vh';
            }
        }
    }

    createPlayButton() {
        const button = document.createElement('button');
        button.className = 'absolute z-20 btn-primary';
        button.innerHTML = '<i class="fas fa-play mr-2"></i>Play Video';
        button.addEventListener('click', () => {
            if (this.video) {
                this.video.play().catch(() => {
                    this.handleVideoError();
                });
            }
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
                list.getEntries().forEach(entry => {
                    // Ignorar recursos de video y solo mostrar otros problemas de rendimiento
                    if (entry.duration > 100 && entry.initiatorType !== 'video') {
                        console.warn('Performance issue detected:', entry);
                    }
                });
            });
            
            // Solo observar métricas de paint y resource
            observer.observe({ entryTypes: ['paint', 'resource'] });
        } catch (e) {
            console.warn('PerformanceObserver error:', e);
        }
    }

    new ScrollController();
    new LanguageController();
    new VideoController();
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar Animation
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Language Switcher
const languageButtons = document.querySelectorAll('.language-switcher button');
const contentElements = document.querySelectorAll('[data-lang]');

languageButtons.forEach(button => {
    button.addEventListener('click', () => {
        const lang = button.getAttribute('data-lang');
        
        // Update active button
        languageButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show/hide content based on language
        contentElements.forEach(element => {
            if (element.getAttribute('data-lang') === lang) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    });
});

// Intersection Observer for Animations
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll').forEach(element => {
    observer.observe(element);
});

// Form Validation and Submission
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        try {
            // Add your form submission logic here
            console.log('Form data:', data);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you for your interest! We will contact you soon.';
            contactForm.appendChild(successMessage);
            
            // Reset form
            contactForm.reset();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'An error occurred. Please try again later.';
            contactForm.appendChild(errorMessage);
            
            // Remove error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        }
    });
}

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
}

// Parallax Effect
document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.parallax').forEach(element => {
        const speed = element.getAttribute('data-speed');
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        
        element.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
});

// Initialize AOS (Animate on Scroll)
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}

// Custom Cursor
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => cursor.classList.add('click'));
document.addEventListener('mouseup', () => cursor.classList.remove('click'));

// Add hover effect to interactive elements
const interactiveElements = document.querySelectorAll('a, button, .interactive');
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});