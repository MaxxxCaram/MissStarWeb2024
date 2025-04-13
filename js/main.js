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
        // Only create AudioContext after user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    this.audioContext.resume();
                } catch (e) {
                    console.warn('AudioContext not supported:', e);
                }
            }
        }, { once: true });

        // Handle video playback
        if (this.video) {
            // Check if video exists before playing
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

        // Check if video fails to load
        const videoSource = this.video.querySelector('source');
        if (videoSource) {
            videoSource.addEventListener('error', () => {
                this.handleVideoError();
            });
        }
    }

    handleVideoError() {
        // Hide video and show backup background
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
    // Initialize controllers
    new ScrollController();
    new LanguageController();
    new VideoController();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scroll
    initializeSmoothScroll();
    
    // Initialize navbar animation
    initializeNavbar();
    
    // Initialize custom cursor
    initializeCustomCursor();
    
    // Initialize parallax effect
    initializeParallax();
    
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100,
            disable: 'mobile'
        });
    }
    
    // Initialize forms
    initializeForms();
    
    // Initialize performance monitoring
    initializePerformanceMonitoring();
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

// Application Form Handler
const applicationForm = document.querySelector('.application-form');
if (applicationForm) {
    // Populate country select
    const countrySelect = applicationForm.querySelector('#country');
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
        "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
        "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
        "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
        "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
        "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
        "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
        "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
        "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
        "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
        "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
        "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
        "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
        "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
        "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
        "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ];

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });

    // Form submission handler
    applicationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(applicationForm);
        const data = Object.fromEntries(formData);
        
        try {
            // Here you would add your API call to submit the form
            console.log('Application data:', data);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'Thank you for your application! We will review it and contact you soon.';
            applicationForm.appendChild(successMessage);
            
            // Reset form
            applicationForm.reset();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting application:', error);
            
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'An error occurred. Please try again later.';
            applicationForm.appendChild(errorMessage);
            
            // Remove error message after 5 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 5000);
        }
    });

    // Word count for biography
    const biographyTextarea = applicationForm.querySelector('#biography');
    const maxWords = 200;

    biographyTextarea.addEventListener('input', () => {
        const words = biographyTextarea.value.trim().split(/\s+/).length;
        if (words > maxWords) {
            const text = biographyTextarea.value.trim().split(/\s+/).slice(0, maxWords).join(' ');
            biographyTextarea.value = text;
        }
    });
}

function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const header = document.querySelector('header');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Prevent menu from closing when clicking inside
        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.querySelector('.mobile-menu');
                const menuToggle = document.querySelector('.menu-toggle');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });
}

function initializeNavbar() {
    const header = document.querySelector('header');
    let lastScroll = 0;
    let scrollTimer = null;

    window.addEventListener('scroll', () => {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }

        scrollTimer = setTimeout(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scroll-up');
                header.classList.remove('scroll-down');
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
        }, 50);
    });
}

function initializeCustomCursor() {
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        let cursorVisible = false;
        let cursorEnlarged = false;

        document.addEventListener('mousemove', (e) => {
            if (!cursorVisible) {
                cursor.style.opacity = 1;
                cursorVisible = true;
            }
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        });

        document.addEventListener('mousedown', () => {
            cursor.classList.add('click');
            cursorEnlarged = true;
        });

        document.addEventListener('mouseup', () => {
            cursor.classList.remove('click');
            cursorEnlarged = false;
        });

        document.querySelectorAll('a, button, .interactive').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                cursorEnlarged = true;
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursorEnlarged = false;
            });
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = 0;
            cursorVisible = false;
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = 1;
            cursorVisible = true;
        });
    }
}

function initializeParallax() {
    if (!window.matchMedia('(max-width: 768px)').matches) {
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                document.querySelectorAll('.parallax').forEach(element => {
                    const speed = element.getAttribute('data-speed') || 0.1;
                    const x = (window.innerWidth - e.pageX * speed) / 100;
                    const y = (window.innerHeight - e.pageY * speed) / 100;
                    
                    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                });
            });
        });
    }
}

function initializeForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showMessage(form, 'success', 'Thank you! We will contact you soon.');
                form.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage(form, 'error', 'An error occurred. Please try again later.');
            }
        });
    });
}

function showMessage(form, type, text) {
    const message = document.createElement('div');
    message.className = `${type}-message`;
    message.textContent = text;
    
    // Remove any existing messages
    form.querySelectorAll('.success-message, .error-message').forEach(msg => msg.remove());
    
    form.appendChild(message);
    setTimeout(() => message.remove(), 5000);
}

function initializePerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 100 && entry.initiatorType !== 'video') {
                        console.warn('Performance issue detected:', {
                            name: entry.name,
                            duration: entry.duration,
                            type: entry.initiatorType
                        });
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource', 'paint', 'largest-contentful-paint'] });
        } catch (e) {
            console.warn('PerformanceObserver error:', e);
        }
    }
}