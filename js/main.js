// Handle responsive menu
document.addEventListener('DOMContentLoaded', () => {
    // Add JavaScript functionality as needed
    // Console filtering is now handled by an inline script in the HTML <head>
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

    // Initialize controllers
    new ScrollController();
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
    
    // Initialize language switcher
    initializeLanguageSwitcher();
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

// Smooth Scroll
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

// Navbar Animation
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

// Updated Language Switcher Function
function initializeLanguageSwitcher() {
    // Get language buttons
    const languageButtons = document.querySelectorAll('.language-switcher button');
    if (!languageButtons.length) {
        console.warn('Language switcher buttons not found');
        return;
    }
    
    // Get stored language or default to English
    const savedLanguage = localStorage.getItem('missstar-language') || 'en';
    
    // Set initial language
    setLanguage(savedLanguage);
    
    // Update UI to show active language immediately
    languageButtons.forEach(button => {
        const buttonLang = button.getAttribute('data-lang');
        button.classList.toggle('active', buttonLang === savedLanguage);
        
        // Add visual feedback (glow effect for active language)
        if (buttonLang === savedLanguage) {
            button.classList.add('language-active');
        } else {
            button.classList.remove('language-active');
        }
    });
    
    // Add click event listeners with improved visual feedback
    languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newLang = this.getAttribute('data-lang');
            if (newLang) {
                // Provide immediate visual feedback
                languageButtons.forEach(btn => {
                    btn.classList.remove('active', 'language-active');
                });
                this.classList.add('active', 'language-active');
                
                // Apply a subtle animation to show change is happening
                document.body.classList.add('language-changing');
                
                // Set language with slight delay for visual effect
                setTimeout(() => {
                    // Set language
                    setLanguage(newLang);
                    
                    // Save preference
                    localStorage.setItem('missstar-language', newLang);
                    
                    // Remove animation class
                    document.body.classList.remove('language-changing');
                    
                    console.log(`Language changed to ${newLang}`);
                }, 50);
            }
        });
    });
    
    // Add debugging to help identify any issues
    console.log('Language switcher initialized with language:', savedLanguage);
    console.log('Language buttons found:', languageButtons.length);
}

// Form Validation and Submission
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

// Mobile Menu Toggle
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

// Parallax Effect
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

// Custom Cursor
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

function initializePerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        try {
            // Completely disable favicon.ico performance warnings
            const originalConsoleWarn = console.warn;
            console.warn = function(...args) {
                if (args.length >= 1 && 
                    typeof args[0] === 'string' && 
                    args[0] === 'Performance issue detected:' &&
                    args.length >= 2 && 
                    args[1] && 
                    args[1].name && 
                    args[1].name.includes('favicon.ico')) {
                    return; // Silently ignore favicon warnings
                }
                return originalConsoleWarn.apply(this, args);
            };
            
            // Track resources loading time
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    // Completely ignore favicon performance checks
                    if (entry.name.includes('favicon')) {
                        return;
                    }
                    
                    // Increase threshold for image resources since they're now optimized
                    const threshold = entry.initiatorType === 'img' ? 200 : 100;
                    
                    if (entry.duration > threshold && entry.initiatorType !== 'video') {
                        console.warn('Performance issue detected:', {
                            name: entry.name,
                            duration: entry.duration,
                            type: entry.initiatorType
                        });
                        
                        // For images that are still slow, try to preload them next time
                        if (entry.initiatorType === 'img' && !entry.name.includes('placehold.co')) {
                            const link = document.createElement('link');
                            link.rel = 'preload';
                            link.href = entry.name;
                            link.as = 'image';
                            document.head.appendChild(link);
                        }
                    }
                });
            });
            
            // Only observe 100% supported entry types - explicitly exclude 'longtask'
            // to avoid console warnings
            const supportedEntryTypes = ['resource', 'paint'];
            
            // Safely check if the browser supports largest-contentful-paint
            if (PerformanceObserver.supportedEntryTypes && 
                Array.isArray(PerformanceObserver.supportedEntryTypes) &&
                PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
                supportedEntryTypes.push('largest-contentful-paint');
            }
            
            // Only register the observer if there are supported entry types
            if (supportedEntryTypes.length > 0) {
                observer.observe({ entryTypes: supportedEntryTypes });
            }
            
            // Add image optimization logic when page loads
            document.addEventListener('DOMContentLoaded', () => {
                // Apply lazy loading to images that are below the fold
                const images = document.querySelectorAll('img:not([loading])');
                images.forEach((img, index) => {
                    if (index >= 2) { // First two images load eagerly, rest lazily
                        img.setAttribute('loading', 'lazy');
                    } else {
                        img.setAttribute('loading', 'eager');
                    }
                    
                    // Set width and height if not already set
                    if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
                        // Default placeholder size
                        img.setAttribute('width', '600');
                        img.setAttribute('height', '400');
                    }
                });
                
                // Add IntersectionObserver to handle delayed animations on images
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            
                            // Add animation transition
                            img.style.transition = 'opacity 0.3s ease-in-out';
                            img.style.opacity = '1';
                            
                            // Stop observing after animation
                            imageObserver.unobserve(img);
                        }
                    });
                }, { threshold: 0.1 });
                
                // Observe all images except logo
                document.querySelectorAll('img:not(.logo img)').forEach(img => {
                    // Set initial state
                    img.style.opacity = '0';
                    imageObserver.observe(img);
                });
            });
            
        } catch (e) {
            console.warn('PerformanceObserver error:', e);
        }
    }
}

// Main language functionality
function setLanguage(lang) {
    console.log('Setting language to:', lang);
    document.documentElement.lang = lang;
    
    // Load translations from external file if available
    let translationsData = window.translations || window.translationsFallback;
    
    // Update all text elements with data-lang attributes
    const elements = document.querySelectorAll('[data-lang-es], [data-lang-en]');
    elements.forEach(el => {
        if (lang === 'es' && el.hasAttribute('data-lang-es')) {
            el.textContent = el.getAttribute('data-lang-es');
        } else if (lang === 'en' && el.hasAttribute('data-lang-en')) {
            el.textContent = el.getAttribute('data-lang-en');
        }
    });
    
    // Handle content sections with data-lang attribute
    const contentSections = document.querySelectorAll('[data-lang]');
    contentSections.forEach(section => {
        if (section.tagName !== 'BUTTON') { // Skip language switcher buttons
            if (section.getAttribute('data-lang') === lang) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        }
    });

    // Update the language buttons active state
    const languageButtons = document.querySelectorAll('.language-switcher button');
    languageButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-lang') === lang);
    });
    
    // Translate common elements across all pages
    translateCommonElements(lang, translationsData);
    
    // Handle form labels and placeholders
    translateFormElements(lang, translationsData);
    
    // Handle page-specific translations
    const pageName = getCurrentPage();
    translatePageContent(pageName, lang, translationsData);
    
    // Debug: output to console what page we're on and what translations we're using
    console.log(`Current page: ${pageName}`, translationsData[pageName]?.[lang] ? 'Translations found' : 'No translations found');
    
    // Force translations for specific elements
    if (document.querySelector('.welcome-text')) {
        const welcomeToText = document.querySelector('.welcome-text .hologram-text:nth-child(1)');
        if (welcomeToText) {
            welcomeToText.textContent = lang === 'es' ? 'Bienvenido a' : 'Welcome to';
        }
        
        const fearlessText = document.querySelector('.text-5xl .glow-text:nth-child(1)');
        if (fearlessText) {
            fearlessText.textContent = lang === 'es' ? 'Intrépidamente Femenina.' : 'Fearlessly Feminine.';
        }
        
        const unapologeticallyText = document.querySelector('.text-5xl .glow-text:nth-child(2)');
        if (unapologeticallyText) {
            unapologeticallyText.textContent = lang === 'es' ? 'Decididamente Poderosa' : 'Unapologetically Powerful';
        }
    }

    // Translate section titles directly
    const sectionTitles = {
        'pageant': { en: 'The Pageant', es: 'El Concurso' },
        'contestants': { en: 'Contestants', es: 'Concursantes' },
        'events': { en: 'Events', es: 'Eventos' },
        'sponsors': { en: 'Sponsors', es: 'Patrocinadores' }
    };

    // Update section titles
    Object.keys(sectionTitles).forEach(sectionId => {
        const sectionTitle = document.querySelector(`#${sectionId} .section-title`);
        if (sectionTitle) {
            sectionTitle.textContent = sectionTitles[sectionId][lang];
        }
    });
    
    // Update specific buttons text
    const buttonTexts = {
        'pageant': { en: 'Learn More', es: 'Más Información' },
        'contestants': { en: 'Meet the Queens', es: 'Conoce a las Reinas' },
        'events': { en: 'View Calendar', es: 'Ver Calendario' },
        'sponsors': { en: 'Our Partners', es: 'Nuestros Socios' }
    };

    // Update buttons
    Object.keys(buttonTexts).forEach(sectionId => {
        const button = document.querySelector(`#${sectionId} .btn-primary`);
        if (button) {
            const iconHTML = button.innerHTML.match(/<i[^>]*><\/i>/) || '';
            button.innerHTML = buttonTexts[sectionId][lang] + ' ' + iconHTML;
        }
    });

    // Update specific paragraph descriptions
    if (document.querySelector('#pageant .section-content p')) {
        document.querySelector('#pageant .section-content p').textContent = lang === 'es' 
            ? 'Experimenta el glamour y la elegancia de nuestro concurso de belleza internacional que celebra la diversidad y el empoderamiento.'
            : 'Experience the glamour and elegance of our international beauty pageant that celebrates diversity and empowerment.';
    }

    if (document.querySelector('#contestants .section-content p')) {
        document.querySelector('#contestants .section-content p').textContent = lang === 'es'
            ? 'Conoce a nuestras increíbles concursantes que representarán a sus países en la competencia de este año.'
            : 'Meet our amazing contestants who will represent their countries in this year\'s competition.';
    }

    if (document.querySelector('#events .section-content p')) {
        document.querySelector('#events .section-content p').textContent = lang === 'es'
            ? 'Consulta nuestro calendario de eventos y actividades durante todo el concurso.'
            : 'Check out our calendar of events and activities throughout the pageant.';
    }

    if (document.querySelector('#sponsors .section-content p')) {
        document.querySelector('#sponsors .section-content p').textContent = lang === 'es'
            ? 'Nuestros patrocinadores oficiales que hacen posible este evento.'
            : 'Our official sponsors who make this event possible.';
    }

    // Update the Apply Now section
    const applyNowTitle = document.querySelector('.apply-now-container h2 .hologram-text');
    if (applyNowTitle) {
        applyNowTitle.textContent = lang === 'es' ? 'Aplica Ahora' : 'Apply Now';
    }

    const applyNowDescription = document.querySelector('.apply-now-container > p');
    if (applyNowDescription) {
        applyNowDescription.textContent = lang === 'es'
            ? 'Las solicitudes ya están abiertas para Miss Star International 2025.'
            : 'Applications are now open for Miss Star International 2025.';
    }

    // Update form labels
    const formLabels = {
        'fullName': { en: 'FULL NAME', es: 'NOMBRE COMPLETO' },
        'email': { en: 'EMAIL', es: 'CORREO ELECTRÓNICO' },
        'country': { en: 'COUNTRY', es: 'PAÍS' },
        'age': { en: 'AGE', es: 'EDAD' },
        'biography': { en: 'BIOGRAPHY (200 WORDS MAX)', es: 'BIOGRAFÍA (MÁXIMO 200 PALABRAS)' },
        'socialImpact': { en: 'SOCIAL IMPACT PLATFORM', es: 'PLATAFORMA DE IMPACTO SOCIAL' }
    };

    // Update each label
    Object.keys(formLabels).forEach(labelFor => {
        const label = document.querySelector(`label[for="${labelFor}"]`);
        if (label) {
            label.textContent = formLabels[labelFor][lang];
        }
    });

    // Update submit button
    const submitButton = document.querySelector('.application-form .submit-button');
    if (submitButton) {
        const iconHTML = submitButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        submitButton.innerHTML = (lang === 'es' ? 'Enviar Solicitud ' : 'Submit Application ') + iconHTML;
    }

    // Update country select placeholder
    const countrySelect = document.querySelector('#country');
    if (countrySelect && countrySelect.options[0]) {
        countrySelect.options[0].text = lang === 'es' ? 'Selecciona tu país' : 'Select your country';
    }

    // Update social impact placeholder
    const socialImpactTextarea = document.querySelector('#socialImpact');
    if (socialImpactTextarea) {
        socialImpactTextarea.placeholder = lang === 'es'
            ? '¿Qué causa defenderías como Miss Star International?'
            : 'What cause would you champion as Miss Star International?';
    }

    // Update word count label
    const wordCountElement = document.querySelector('.word-count');
    if (wordCountElement) {
        const currentWords = wordCountElement.textContent.split('/')[0];
        wordCountElement.textContent = `${currentWords}/${lang === 'es' ? 'palabras' : 'words'}`;
    }

    // Update form processing message translations
    document.querySelectorAll('.form-processing-messages').forEach(el => {
        if (el.getAttribute('data-message-type') === 'processing') {
            el.innerHTML = lang === 'es' 
                ? '<i class="fas fa-circle-notch fa-spin mr-2"></i> Procesando...'
                : '<i class="fas fa-circle-notch fa-spin mr-2"></i> Processing...';
        }
    });

    // Translate form success/error messages
    const successMessage = {
        en: 'Thank you for your application! We will review it and contact you soon.',
        es: '¡Gracias por tu solicitud! La revisaremos y te contactaremos pronto.'
    };

    const errorMessage = {
        en: 'An error occurred. Please try again later.',
        es: 'Ocurrió un error. Por favor, inténtalo de nuevo más tarde.'
    };

    // Update footer content
    const copyright = document.querySelector('footer .text-gray-500');
    if (copyright) {
        copyright.textContent = lang === 'es'
            ? '© 2025 Miss Star International. Todos los derechos reservados.'
            : '© 2025 Miss Star International. All rights reserved.';
    }

    const footerLinks = document.querySelectorAll('.footer-link');
    const footerTranslations = {
        'index.html': { en: 'Home', es: 'Inicio' },
        'company.html': { en: 'The Company', es: 'La Compañía' },
        'about.html': { en: 'About Us', es: 'Sobre Nosotros' },
        'consortium.html': { en: 'Consortium', es: 'Consorcio' },
        'empower.html': { en: 'EmpowerTransNation', es: 'EmpowerTransNation' },
        'dynasty.html': { en: 'Dynasty Platform', es: 'Plataforma Dynasty' },
        'halloffame.html': { en: 'Hall of Fame', es: 'Salón de la Fama' },
        'partners.html': { en: 'Partners', es: 'Colaboradores' },
        'news.html': { en: 'News', es: 'Noticias' }
    };

    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (footerTranslations[href]) {
            link.textContent = footerTranslations[href][lang];
        }
    });

    const phoneText = document.querySelector('footer p:nth-of-type(2)');
    if (phoneText) {
        const phone = phoneText.querySelector('a');
        if (phone) {
            phoneText.innerHTML = (lang === 'es' ? 'Teléfono: ' : 'Phone: ') + 
                '<a href="tel:+15056218615" class="text-star-gold hover:text-opacity-80">+1 (505) 621-8615</a>';
        }
    }
    
    // Force update on all navigation links
    const navigationLinks = document.querySelectorAll('nav a');
    navigationLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === 'index.html' || href === './index.html' || href === '/' || href === './') {
            link.textContent = lang === 'es' ? 'Inicio' : 'Home';
        } else if (href === 'company.html' || href === './company.html') {
            link.textContent = lang === 'es' ? 'La Compañía' : 'The Company';
        } else if (href === 'about.html' || href === './about.html') {
            link.textContent = lang === 'es' ? 'Sobre Nosotros' : 'About Us';
        } else if (href === 'consortium.html' || href === './consortium.html') {
            link.textContent = lang === 'es' ? 'Consorcio' : 'Consortium';
        } else if (href === 'empower.html' || href === './empower.html') {
            link.textContent = lang === 'es' ? 'EmpowerTransNation' : 'EmpowerTransNation';
        } else if (href === 'dynasty.html' || href === './dynasty.html') {
            link.textContent = lang === 'es' ? 'Plataforma Dynasty' : 'Dynasty Platform';
        } else if (href === 'halloffame.html' || href === './halloffame.html') {
            link.textContent = lang === 'es' ? 'Salón de la Fama' : 'Hall of Fame';
        } else if (href === 'partners.html' || href === './partners.html') {
            link.textContent = lang === 'es' ? 'Colaboradores' : 'Partners';
        } else if (href === 'news.html' || href === './news.html') {
            link.textContent = lang === 'es' ? 'Noticias' : 'News';
        }
    });
}

// Add function to translate common elements
function translateCommonElements(lang, translationsData) {
    if (!translationsData || !translationsData.common || !translationsData.common[lang]) {
        console.warn(`Common translations not found for ${lang}`);
        return;
    }
    
    const commonTranslations = translationsData.common[lang];
    
    // Translate navigation menu
    if (document.querySelector('nav')) {
        // Home
        const homeLink = document.querySelector('nav a[href="index.html"], nav a[href="./index.html"], nav a[href="/"], nav a[href="./"]');
        if (homeLink) homeLink.textContent = commonTranslations.home;
        
        // Company
        const companyLink = document.querySelector('nav a[href="company.html"], nav a[href="./company.html"]');
        if (companyLink) companyLink.textContent = commonTranslations.company;
        
        // About Us
        const aboutLink = document.querySelector('nav a[href="about.html"], nav a[href="./about.html"]');
        if (aboutLink) aboutLink.textContent = commonTranslations.aboutUs;
        
        // Consortium
        const consortiumLink = document.querySelector('nav a[href="consortium.html"], nav a[href="./consortium.html"]');
        if (consortiumLink) consortiumLink.textContent = commonTranslations.consortium;
        
        // EmpowerTransNation
        const empowerLink = document.querySelector('nav a[href="empower.html"], nav a[href="./empower.html"]');
        if (empowerLink) empowerLink.textContent = commonTranslations.empowerTransNation;
        
        // Dynasty Platform
        const dynastyLink = document.querySelector('nav a[href="dynasty.html"], nav a[href="./dynasty.html"]');
        if (dynastyLink) dynastyLink.textContent = commonTranslations.dynastyPlatform;
        
        // Hall of Fame
        const hallOfFameLink = document.querySelector('nav a[href="halloffame.html"], nav a[href="./halloffame.html"]');
        if (hallOfFameLink) hallOfFameLink.textContent = commonTranslations.hallOfFame;
        
        // Partners
        const partnersLink = document.querySelector('nav a[href="partners.html"], nav a[href="./partners.html"]');
        if (partnersLink) partnersLink.textContent = commonTranslations.partners;
        
        // News
        const newsLink = document.querySelector('nav a[href="news.html"], nav a[href="./news.html"]');
        if (newsLink) newsLink.textContent = commonTranslations.news;
    }
    
    // Translate footer elements
    const footerCopyright = document.querySelector('footer .text-gray-500');
    if (footerCopyright) footerCopyright.innerHTML = commonTranslations.copyright.replace('2024', '2025');
    
    const footerCompanyInfo = document.querySelector('footer h4');
    if (footerCompanyInfo) footerCompanyInfo.innerHTML = commonTranslations.companyInfo;
    
    const footerPhone = document.querySelector('footer p:nth-of-type(2)');
    if (footerPhone) {
        const phoneLink = footerPhone.querySelector('a');
        if (phoneLink) {
            const phoneText = commonTranslations.phone;
            footerPhone.innerHTML = phoneText.replace('+1 (505) 621-8615', `<a href="tel:+15056218615" class="text-star-gold hover:text-opacity-80">+1 (505) 621-8615</a>`);
        }
    }
    
    // Translate footer links
    const footerLinks = document.querySelectorAll('.footer-link');
    footerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === 'index.html') link.textContent = commonTranslations.home;
        if (href === 'company.html') link.textContent = commonTranslations.company;
        if (href === 'about.html') link.textContent = commonTranslations.aboutUs;
        if (href === 'consortium.html') link.textContent = commonTranslations.consortium;
        if (href === 'empower.html') link.textContent = commonTranslations.empowerTransNation;
        if (href === 'dynasty.html') link.textContent = commonTranslations.dynastyPlatform;
        if (href === 'halloffame.html') link.textContent = commonTranslations.hallOfFame;
        if (href === 'partners.html') link.textContent = commonTranslations.partners;
        if (href === 'news.html') link.textContent = commonTranslations.news;
    });
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    if (!filename || filename === '' || filename === 'index.html') {
        return 'index';
    }
    return filename.replace('.html', '');
}

function translateFormElements(lang, translationsData) {
    // Get page-specific translations if available
    const pageName = getCurrentPage();
    let pageTranslations = null;
    
    if (translationsData && translationsData[pageName] && translationsData[pageName][lang]) {
        pageTranslations = translationsData[pageName][lang];
    }
    
    // Fall back to basic translations if page-specific not available
    const basicTranslations = window.translationsFallback[lang] || null;
    
    // Translate form elements
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Application form specific translations
        if (form.classList.contains('application-form')) {
            // Full Name
            const fullNameLabel = form.querySelector('label[for="fullName"]');
            if (fullNameLabel) {
                fullNameLabel.textContent = pageTranslations ? 
                    (pageTranslations.fullName || basicTranslations?.full_name || "FULL NAME") : 
                    (basicTranslations?.full_name || "FULL NAME");
            }
            
            // Email
            const emailLabel = form.querySelector('label[for="email"]');
            if (emailLabel) {
                emailLabel.textContent = pageTranslations ? 
                    (pageTranslations.email || basicTranslations?.email || "EMAIL") : 
                    (basicTranslations?.email || "EMAIL");
            }
            
            // Country
            const countryLabel = form.querySelector('label[for="country"]');
            if (countryLabel) {
                countryLabel.textContent = pageTranslations ? 
                    (pageTranslations.country || basicTranslations?.country || "COUNTRY") : 
                    (basicTranslations?.country || "COUNTRY");
            }
            
            // Age
            const ageLabel = form.querySelector('label[for="age"]');
            if (ageLabel) {
                ageLabel.textContent = pageTranslations ? 
                    (pageTranslations.age || basicTranslations?.age || "AGE") : 
                    (basicTranslations?.age || "AGE");
            }
            
            // Biography
            const biographyLabel = form.querySelector('label[for="biography"]');
            if (biographyLabel) {
                biographyLabel.textContent = pageTranslations ? 
                    (pageTranslations.biography || basicTranslations?.biography || "BIOGRAPHY (200 WORDS MAX)") : 
                    (basicTranslations?.biography || "BIOGRAPHY (200 WORDS MAX)");
            }
            
            // Social Impact
            const socialImpactLabel = form.querySelector('label[for="socialImpact"]');
            if (socialImpactLabel) {
                socialImpactLabel.textContent = pageTranslations ? 
                    (pageTranslations.socialImpact || basicTranslations?.social_impact || "SOCIAL IMPACT PLATFORM") : 
                    (basicTranslations?.social_impact || "SOCIAL IMPACT PLATFORM");
            }
            
            // Submit button
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                const iconHTML = submitButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
                submitButton.innerHTML = (pageTranslations ? 
                    (pageTranslations.submit || basicTranslations?.submit || "Submit Application") : 
                    (basicTranslations?.submit || "Submit Application")) + ' ' + iconHTML;
            }
        }
        
        // Other forms - using data attributes
        const labels = form.querySelectorAll('label[data-i18n]');
        labels.forEach(label => {
            const key = label.getAttribute('data-i18n');
            if (pageTranslations && pageTranslations[key]) {
                label.textContent = pageTranslations[key];
            }
        });
        
        const inputs = form.querySelectorAll('input[data-i18n-placeholder], textarea[data-i18n-placeholder]');
        inputs.forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            if (pageTranslations && pageTranslations[key]) {
                input.placeholder = pageTranslations[key];
            }
        });
    });
    
    // Translate Apply Now title if exists
    const applyNowTitle = document.querySelector('.apply-now-container h2 .hologram-text');
    if (applyNowTitle) {
        applyNowTitle.textContent = pageTranslations ? 
            (pageTranslations.applyNow || basicTranslations?.apply_now || "Apply Now") : 
            (basicTranslations?.apply_now || "Apply Now");
    }
}

// Update the page-specific translation function to use external translations
function translatePageContent(pageName, lang, translationsData) {
    console.log(`Translating ${pageName} page to ${lang}`);
    
    // Skip if translations not found
    if (!translationsData || !translationsData[pageName] || !translationsData[pageName][lang]) {
        console.warn(`Translations not found for page ${pageName} in ${lang}`);
        return;
    }
    
    const pageTranslations = translationsData[pageName][lang];
    
    // Translate all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (pageTranslations[key]) {
            element.innerHTML = pageTranslations[key];
        }
    });
    
    // Handle page-specific translations based on page name
    switch(pageName) {
        case 'index':
            translateIndexPage(pageTranslations);
            break;
        case 'company':
            translateCompanyPage(pageTranslations);
            break;
        case 'about':
            translateAboutPage(pageTranslations);
            break;
        case 'consortium':
            translateConsortiumPage(pageTranslations);
            break;
        // Add other pages as needed
    }
}

// Page-specific translation functions
function translateIndexPage(translations) {
    if (!translations) return;
    
    // Hero section
    const welcomeToText = document.querySelector('.welcome-text .hologram-text:nth-child(1)');
    if (welcomeToText) welcomeToText.textContent = translations.welcomeTitle || "Welcome to";
    
    const missStarText = document.querySelector('.welcome-text .hologram-text:nth-child(2)');
    if (missStarText) missStarText.textContent = "Miss Star";
    
    const internationalText = document.querySelector('.welcome-text .hologram-text:nth-child(3)');
    if (internationalText) internationalText.textContent = "International";
    
    const heroDescription = document.querySelector('.hero-section p');
    if (heroDescription) heroDescription.textContent = translations.heroDescription || "";
    
    // Pageant section
    const pageantDescription = document.querySelector('#pageant .section-content p');
    if (pageantDescription) pageantDescription.textContent = translations.pageantDescription || "Experience the glamour and elegance of our international beauty pageant that celebrates diversity and empowerment.";
    
    const pageantButton = document.querySelector('#pageant .btn-primary');
    if (pageantButton) {
        const iconHTML = pageantButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        pageantButton.innerHTML = (translations.learnMore || "Learn More") + ' ' + iconHTML;
    }
    
    // Contestants section
    const contestantsDescription = document.querySelector('#contestants .section-content p');
    if (contestantsDescription) contestantsDescription.textContent = translations.contestantsDescription || "Meet our amazing contestants who will represent their countries in this year's competition.";
    
    const contestantsButton = document.querySelector('#contestants .btn-primary');
    if (contestantsButton) {
        const iconHTML = contestantsButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        contestantsButton.innerHTML = (translations.meetQueens || "Meet the Queens") + ' ' + iconHTML;
    }
    
    // Events section
    const eventsDescription = document.querySelector('#events .section-content p');
    if (eventsDescription) eventsDescription.textContent = translations.eventsDescription || "Check out our calendar of events and activities throughout the pageant.";
    
    const eventsButton = document.querySelector('#events .btn-primary');
    if (eventsButton) {
        const iconHTML = eventsButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        eventsButton.innerHTML = (translations.viewCalendar || "View Calendar") + ' ' + iconHTML;
    }
    
    // Sponsors section
    const sponsorsDescription = document.querySelector('#sponsors .section-content p');
    if (sponsorsDescription) sponsorsDescription.textContent = translations.sponsorsDescription || "Our official sponsors who make this event possible.";
    
    const sponsorsButton = document.querySelector('#sponsors .btn-primary');
    if (sponsorsButton) {
        const iconHTML = sponsorsButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        sponsorsButton.innerHTML = (translations.ourPartners || "Our Partners") + ' ' + iconHTML;
    }
    
    // Apply Now section
    const applyNowDescription = document.querySelector('.apply-now-container > p');
    if (applyNowDescription) applyNowDescription.textContent = translations.applyNowDescription || "Applications are now open for Miss Star International 2025.";
}

function translateCompanyPage(translations) {
    if (!translations) return;
    
    // Page title and introduction
    const pageTitle = document.querySelector('.page-header h1');
    if (pageTitle) pageTitle.textContent = translations.pageTitle || "The Company";
    
    const introText = document.querySelector('.intro-section p');
    if (introText) introText.textContent = translations.introText || "";
    
    // Values section
    const valuesTitle = document.querySelector('.values-section h2');
    if (valuesTitle) valuesTitle.textContent = translations.valuesTitle || "Our Values";
    
    // And additional translations specific to the company page...
}

function translateAboutPage(translations) {
    if (!translations) return;
    
    // Page title and introduction
    const pageTitle = document.querySelector('.page-header h1');
    if (pageTitle) pageTitle.textContent = translations.pageTitle || "About Us";
    
    const introText = document.querySelector('.intro-section p');
    if (introText) introText.textContent = translations.introText || "";
    
    // Founder section
    const founderTitle = document.querySelector('.founder-section h2');
    if (founderTitle) founderTitle.textContent = translations.founderTitle || "";
    
    // And additional translations specific to the about page...
}

function translateConsortiumPage(translations) {
    if (!translations || !translations.consortium) return;
    
    const translationsForPage = translations.consortium[getCurrentLanguage()];
    if (!translationsForPage) return;
    
    // Page title
    const pageTitle = document.querySelector('.consortium-section h1');
    if (pageTitle) pageTitle.textContent = translationsForPage.pageTitle || "Miss Star Consortium";
    
    // Intro text
    const introText = document.querySelector('.consortium-intro p');
    if (introText) introText.textContent = translationsForPage.introText || "";
    
    // Vision section
    const visionTitle = document.querySelector('.vision-section h2');
    if (visionTitle) visionTitle.textContent = translationsForPage.visionTitle || "Our Vision";
    
    // And additional translations specific to the consortium page...
}

// Basic translations as fallback
window.translationsFallback = {
    common: {
        en: {
            home: "Home",
            company: "The Company",
            aboutUs: "About Us",
            consortium: "Consortium",
            empowerTransNation: "EmpowerTransNation",
            dynastyPlatform: "Dynasty Platform",
            hallOfFame: "Hall of Fame",
            partners: "Partners",
            news: "News",
            copyright: "© 2025 Miss Star International. All rights reserved.",
            companyInfo: "Miss Star International",
            phone: "Phone: +1 (505) 621-8615"
        },
        es: {
            home: "Inicio",
            company: "La Compañía",
            aboutUs: "Sobre Nosotros",
            consortium: "Consorcio",
            empowerTransNation: "EmpowerTransNation",
            dynastyPlatform: "Plataforma Dynasty",
            hallOfFame: "Salón de la Fama",
            partners: "Colaboradores",
            news: "Noticias",
            copyright: "© 2025 Miss Star International. Todos los derechos reservados.",
            companyInfo: "Miss Star International",
            phone: "Teléfono: +1 (505) 621-8615"
        }
    },
    // ... rest of the translations ...
};

// Ensure window.translations is available
window.translations = window.translations || window.translationsFallback;

// Application Form Handler
// ... existing code ...

// Helper function to get current language
function getCurrentLanguage() {
    return document.documentElement.lang || localStorage.getItem('missstar-language') || 'en';
}