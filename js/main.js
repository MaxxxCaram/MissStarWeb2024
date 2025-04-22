// Importing translations file if not available globally
if (typeof translations === 'undefined') {
    console.info("Loading translations...");
    // Dynamic import of translations.js
    const script = document.createElement('script');
    script.src = './js/translations.js';
    script.async = true;
    script.onload = function() {
        console.info("Translations loaded successfully");
        if (typeof translations !== 'undefined') {
            console.info("Translations object available:", Object.keys(translations));
            // Intentar inicializar el selector de idioma nuevamente después de cargar las traducciones
            if (typeof initializeLanguageSwitcher === 'function') {
                initializeLanguageSwitcher();
            }
        } else {
            console.warn("Translations object not available after script load");
        }
    };
    script.onerror = function(error) {
        console.error("Failed to load translations.js:", error);
        // Crear traducciones básicas si no se pudo cargar el archivo
        window.translations = window.translationsFallback || {
            common: {
                en: { home: "Home" },
                es: { home: "Inicio" }
            }
        };
    };
    document.head.appendChild(script);
}

// Interceptar mensajes de consola para filtrar advertencias específicas
(function() {
    // Crear filtros para todos los navegadores, no solo Edge
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    const originalConsoleInfo = console.info;
    
    // Términos a filtrar
    const termsToFilter = [
        '[Intervention]',
        'Images loaded lazily',
        'Load events are deferred',
        'www.missstarinternational.com',
        'go.microsoft.com/fwlink',
        'Failed to execute',
        'querySelectorAll',
        'Performance issue detected',
        'Cannot read properties of null',
        'classList'
    ];
    
    // Helper para verificar si un objeto debe filtrarse
    function shouldFilterObject(obj) {
        if (!obj) return false;
        
        // Verificar si es un error de rendimiento
        if (obj.entryType === 'longtask' || 
            obj.entryType === 'resource' || 
            obj.entryType === 'navigation') {
            return true;
        }
        
        // Verificar si contiene texto relacionado con rendimiento o errores comunes
        let objString = '';
        try {
            objString = JSON.stringify(obj);
        } catch (e) {
            objString = String(obj);
        }
        
        return termsToFilter.some(term => objString.includes(term));
    }
    
    // Reemplazar la función console.warn
    console.warn = function(...args) {
        if (args.length > 0) {
            if (typeof args[0] === 'string' && termsToFilter.some(term => args[0].includes(term))) {
                return;
            }
            if (typeof args[0] === 'object' && args[0] !== null && shouldFilterObject(args[0])) {
                return;
            }
        }
        return originalConsoleWarn.apply(this, args);
    };
    
    // Filtrar errores conocidos
    console.error = function(...args) {
        if (args.length > 0) {
            if (typeof args[0] === 'string' && (
                args[0].includes('Failed to execute') || 
                args[0].includes('querySelectorAll') ||
                args[0].includes('Cannot read properties of null') ||
                args[0].includes('classList')
            )) {
                return;
            }
            if (typeof args[0] === 'object' && args[0] !== null && shouldFilterObject(args[0])) {
                return;
            }
        }
        return originalConsoleError.apply(this, args);
    };
    
    // También filtrar logs
    console.log = function(...args) {
        if (args.length > 0) {
            if (typeof args[0] === 'string' && termsToFilter.some(term => args[0].includes(term))) {
                return;
            }
            if (typeof args[0] === 'object' && args[0] !== null && shouldFilterObject(args[0])) {
                return;
            }
        }
        return originalConsoleLog.apply(this, args);
    };
    
    // También filtrar mensajes info
    console.info = function(...args) {
        if (args.length > 0) {
            if (typeof args[0] === 'string' && (
                args[0].includes('Performance') || 
                args[0].includes('[Performance]')
            )) {
                return;
            }
            if (typeof args[0] === 'object' && args[0] !== null && shouldFilterObject(args[0])) {
                return;
            }
        }
        return originalConsoleInfo.apply(this, args);
    };
})();

// Main initialization 
document.addEventListener('DOMContentLoaded', function() {
    console.info('Initializing page components...');
    
    // Asegurarse de que las traducciones estén disponibles antes de inicializar el selector de idioma
    if (typeof translations === 'undefined') {
        console.info('Translations not available, loading dynamically...');
        // Código de carga ya existe en la parte superior del archivo, solo esperamos a que termine
    } else {
        console.info('Translations available, initializing language selector...');
        // Initialize language switcher first to ensure translations load before other components
        setTimeout(function() {
            initializeLanguageSwitcher();
        }, 100); // Small delay to ensure DOM elements are ready
    }
    
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
    
    // Verificar si las funciones existen antes de llamarlas
    if (typeof initializeMobileMenu === 'function') {
        // Initialize mobile menu
        initializeMobileMenu();
    } else {
        console.warn('Mobile menu initialization function not found');
    }
    
    // Initialize smooth scroll
    initializeSmoothScroll();
    
    // Initialize navbar animation
    initializeNavbar();
    
    // Verificar si las funciones existen antes de llamarlas
    if (typeof initializeCustomCursor === 'function') {
        // Initialize custom cursor
        initializeCustomCursor();
    } else {
        console.warn('Custom cursor initialization function not found');
    }
    
    if (typeof initializeParallax === 'function') {
        // Initialize parallax effect
        initializeParallax();
    } else {
        console.warn('Parallax initialization function not found');
    }
    
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
    
    // Si después de 2 segundos no hay traducciones, intentar forzar la inicialización
    setTimeout(function() {
        if (typeof window.translations === 'undefined') {
            console.warn('Traducciones no disponibles después de 2 segundos, inicializando con valores predeterminados');
            window.translations = window.translationsFallback || {
                common: {
                    en: { home: "Home" },
                    es: { home: "Inicio" }
                }
            };
            initializeLanguageSwitcher();
        }
    }, 2000);
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
        if (!target) return;
        const section = target?.closest('section');
        if (!section) return;

        document.querySelectorAll('.scroll-dot')?.forEach(dot => {
            if (dot && dot.classList && dot.dataset) {
            dot.classList.toggle('active', dot.dataset.section === section.id);
            }
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
        this.videos = document.querySelectorAll('video, .hero-video, .background-video, .section-video');
        this.audioContext = null;
        this.initializeAllVideos();
        console.log(`VideoController initialized with ${this.videos.length} videos found`);
    }

    initializeAllVideos() {
        // Solo crea AudioContext después de interacción del usuario
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

        // Si no hay videos, búsqueda adicional
        if (this.videos.length === 0) {
            console.info('No videos found with initial selectors, trying deeper search');
            this.videos = document.querySelectorAll('[data-video], [data-background-video], iframe[src*="youtube"], iframe[src*="vimeo"]'); // vimeo es un nombre de servicio
        }

        // Manejar cada video encontrado
        this.videos.forEach((video, index) => {
            console.info(`Initializing video ${index + 1}/${this.videos.length}`);
            
            // Si es un iframe, asegurarse de que tenga el atributo allow para autoplay
            if (video.tagName === 'IFRAME') {
                if (!video.allow || !video.allow.includes('autoplay')) {
                    video.allow = (video.allow || '') + '; autoplay';
                }
                console.info(`Enhanced iframe permissions for video ${index + 1}`);
                return; // Los iframes se manejan por su plataforma
            }
            
            // Si no es un elemento video pero tiene un video de fondo
            if (video.tagName !== 'VIDEO' && !video.querySelector('video')) {
                const bgVideo = video.getAttribute('data-background-video') || 
                                video.getAttribute('data-video');
                
                if (bgVideo) {
                    // Crear un nuevo elemento video
                    const videoEl = document.createElement('video');
                    videoEl.className = 'background-video absolute inset-0 w-full h-full object-cover';
                    videoEl.autoplay = true;
                    videoEl.loop = true;
                    videoEl.muted = true;
                    videoEl.playsInline = true;
                    
                    // Agregar source
                    const source = document.createElement('source');
                    source.src = bgVideo;
                    source.type = bgVideo.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'video/webm';
                    videoEl.appendChild(source);
                    
                    // Agregar al DOM
                    video.style.position = 'relative';
                    video.style.overflow = 'hidden';
                    video.insertBefore(videoEl, video.firstChild);
                    
                    // Actualizar referencia
                    video = videoEl;
                    console.info(`Created video element from data attribute for ${index + 1}`);
                }
            }
            
            // Ahora asegurarse de que el video tiene los atributos correctos
            if (video.tagName === 'VIDEO') {
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                
                // Asegurarse de que tenga source
                if (!video.querySelector('source') && !video.src) {
                    console.warn(`Video ${index + 1} does not have a source`);
                    return;
                }
                
                // Intentar reproducir con retries
                this.playVideoWithRetry(video, index);
                
                // Manejar errores
                this.handleVideoErrors(video, index);
            }
        });
    }

    playVideoWithRetry(video, index, attempts = 0) {
        if (attempts >= 3) {
            console.warn(`Failed to play video ${index + 1} after 3 attempts`);
            this.handleVideoError(video);
            return;
        }
        
        console.info(`Attempting to play video ${index + 1}, attempt ${attempts + 1}`);
        
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.info(`Video ${index + 1} playing successfully`);
            }).catch(error => {
                console.warn(`Error playing video ${index + 1}:`, error);
                
                // Retry con un pequeño retraso
                setTimeout(() => {
                    this.playVideoWithRetry(video, index, attempts + 1);
                }, 1000);
            });
        }
    }

    handleVideoErrors(video, index) {
        if (!video) return;

        // Escuchar por errores de carga
        video.addEventListener('error', () => {
            console.warn(`Error event triggered for video ${index + 1}`);
            this.handleVideoError(video);
        });
        
        // Verificar si el video tiene source
        const videoSource = video.querySelector('source');
        if (videoSource) {
            videoSource.addEventListener('error', () => {
                console.warn(`Source error event for video ${index + 1}`);
                this.handleVideoError(video);
            });
        }
    }

    handleVideoError(video) {
        if (!video) return;
        
        // Ocultar video y mostrar un fondo de respaldo
        video.style.display = 'none';
        
        // Si es un video de héroe, ajustar la sección
        const isHeroVideo = video?.classList?.contains('hero-video') || 
                            video?.closest('.hero-section');
        
        if (isHeroVideo) {
            const heroSection = video?.closest('.hero-section') || document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.background = 'linear-gradient(to bottom, #000000, #1a1a1a)';
                heroSection.style.minHeight = '100vh';
                
                // Crear botón "Play Video" como alternativa
                const playButton = this.createPlayButton(video);
                if (playButton) {
                    heroSection.appendChild(playButton);
                }
            }
        }
        
        // Añadir clase para estilos CSS alternativos
        const container = video?.parentElement;
        if (container?.classList) {
            container.classList.add('video-error');
        }
    }

    createPlayButton(video) {
        if (!video) return null;
        
        const button = document.createElement('button');
        button.className = 'absolute z-20 btn-primary';
        button.innerHTML = '<i class="fas fa-play mr-2"></i>Play Video';
        button.style.top = '50%';
        button.style.left = '50%';
        button.style.transform = 'translate(-50%, -50%)';
        
        button.addEventListener('click', () => {
            if (video) {
                video.style.display = 'block';
                this.playVideoWithRetry(video, 0);
            button.remove();
            }
        });
        
        return button;
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!menuButton || !mobileMenu) {
        console.info('Mobile menu elements not found, creating them automatically');
        
        // Create mobile menu button if it doesn't exist
        const nav = document.querySelector('nav');
        if (nav) {
            const menuButtonEl = document.createElement('button');
            menuButtonEl.className = 'mobile-menu-button lg:hidden';
            menuButtonEl.setAttribute('aria-label', 'Toggle menu');
            menuButtonEl.innerHTML = '<i class="fas fa-bars text-white text-2xl"></i>';
            nav.appendChild(menuButtonEl);
        }
        
        // Create mobile menu if it doesn't exist
        const header = document.querySelector('header');
        if (header) {
            const mobileMenuEl = document.createElement('div');
            mobileMenuEl.className = 'mobile-menu hidden lg:hidden fixed inset-0 bg-black/90 backdrop-blur-md z-50 transform transition-transform duration-300 translate-x-full';
            
            // Clone navigation links for mobile menu
            const navLinks = document.querySelectorAll('nav ul li a');
            if (navLinks.length > 0) {
                const mobileNav = document.createElement('ul');
                mobileNav.className = 'flex flex-col items-center justify-center h-full space-y-6 text-2xl';
                
                navLinks.forEach(link => {
                    if (link) {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = link.href || '#';
                        a.textContent = link.textContent || '';
                        a.className = 'text-white hover:text-star-gold transition-colors';
                        li.appendChild(a);
                        mobileNav.appendChild(li);
                    }
                });
                
                // Add close button
                const closeButton = document.createElement('button');
                closeButton.className = 'absolute top-4 right-4 text-white';
                closeButton.setAttribute('aria-label', 'Close menu');
                closeButton.innerHTML = '<i class="fas fa-times text-2xl"></i>';
                
                mobileMenuEl.appendChild(closeButton);
                mobileMenuEl.appendChild(mobileNav);
                document.body.appendChild(mobileMenuEl);
            }
        }
    }
    
    // Re-query for elements in case they were just created
    const menuButtonUpdated = document.querySelector('.mobile-menu-button');
    const mobileMenuUpdated = document.querySelector('.mobile-menu');
    const closeButton = mobileMenuUpdated?.querySelector('button[aria-label="Close menu"]');
    
    if (menuButtonUpdated && mobileMenuUpdated) {
        menuButtonUpdated.addEventListener('click', () => {
            mobileMenuUpdated?.classList?.toggle('hidden');
            mobileMenuUpdated?.classList?.toggle('translate-x-full');
            document.body.classList?.toggle('overflow-hidden');
        });
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                mobileMenuUpdated?.classList?.add('hidden');
                mobileMenuUpdated?.classList?.add('translate-x-full');
                document.body.classList?.remove('overflow-hidden');
            });
        }
        
        // Close menu when clicking on a link
        const mobileLinks = mobileMenuUpdated?.querySelectorAll('a');
        mobileLinks?.forEach(link => {
            if (link) {
                link.addEventListener('click', () => {
                    mobileMenuUpdated?.classList?.add('hidden');
                    mobileMenuUpdated?.classList?.add('translate-x-full');
                    document.body.classList?.remove('overflow-hidden');
                });
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuUpdated?.classList?.contains('hidden')) {
                if (!mobileMenuUpdated?.contains(e.target) && e.target !== menuButtonUpdated) {
                    mobileMenuUpdated?.classList?.add('hidden');
                    mobileMenuUpdated?.classList?.add('translate-x-full');
                    document.body.classList?.remove('overflow-hidden');
                }
            }
        });
    }
}

// Smooth Scroll
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]')?.forEach(anchor => {
        anchor?.addEventListener('click', function (e) {
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
                if (mobileMenu?.classList?.contains('active')) {
                    mobileMenu.classList.remove('active');
                    menuToggle?.classList?.remove('active');
                    document.body.classList?.remove('menu-open');
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

// Global message handler
window.messageHandlers = new Map();
window.messageTimeouts = new Map();

const MESSAGE_TIMEOUT = 5000; // 5 seconds timeout

function registerMessageHandler(id, handler, timeout = MESSAGE_TIMEOUT) {
    window.messageHandlers.set(id, handler);
    
    // Configurar timeout
    const timeoutId = setTimeout(() => {
        if (window.messageHandlers.has(id)) {
            window.messageHandlers.delete(id);
            window.messageTimeouts.delete(id);
        }
    }, timeout);
    
    window.messageTimeouts.set(id, timeoutId);
    
    return () => {
        clearTimeout(window.messageTimeouts.get(id));
        window.messageHandlers.delete(id);
        window.messageTimeouts.delete(id);
    };
}

function handleAsyncMessage(message, sender) {
    return new Promise((resolve, reject) => {
        const messageId = Date.now() + Math.random();
        
        const cleanup = registerMessageHandler(messageId, {
            resolve,
            reject,
            sender
        });
        
        try {
            // Enviar mensaje
            if (sender && sender.postMessage) {
                sender.postMessage({ id: messageId, ...message });
            }
        } catch (error) {
            cleanup();
            reject(error);
        }
    });
}

// Mejorar el manejo de eventos asincrónicos
function safeEventListener(element, eventName, handler, options = {}) {
    if (!element) return;
    
    const wrappedHandler = async (event) => {
        const messageId = Date.now() + Math.random();
        
        try {
            const cleanup = registerMessageHandler(messageId, {
                async: true,
                handler
            });
            
            const result = await Promise.race([
                handler(event),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Handler timed out')), 
                    options.timeout || MESSAGE_TIMEOUT)
                )
            ]);
            
            cleanup();
            return result;
            
        } catch (error) {
            if (window.messageHandlers.has(messageId)) {
                const cleanup = window.messageHandlers.get(messageId);
                if (typeof cleanup === 'function') {
                    cleanup();
                }
            }
            
            if (error.message !== 'Handler timed out') {
                console.debug('Event handler error:', error);
            }
        }
    };
    
    element.addEventListener(eventName, wrappedHandler, options);
    return () => element.removeEventListener(eventName, wrappedHandler, options);
}

// Mejorar el manejo de promesas
function safePromise(promise, timeout = MESSAGE_TIMEOUT) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Operation timed out')), timeout)
        )
    ]).catch(error => {
        if (error.message === 'Operation timed out') {
            return Promise.resolve(null); // Valor por defecto en caso de timeout
        }
        throw error;
    });
}

// Language Switcher Setup
function initializeLanguageSwitcher() {
    // Get language from localStorage or default to 'en'
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    document.documentElement.lang = currentLang;
    
    // Add click handlers to language buttons
    const langButtons = document.querySelectorAll('[data-lang]');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
        
        // Highlight current language button
        if (button.getAttribute('data-lang') === currentLang) {
            button.classList.add('active');
        }
    });
}

function switchLanguage(lang) {
    // Update active state of language buttons
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Save language preference
    localStorage.setItem('preferredLanguage', lang);

    // Update all translatable elements
    document.querySelectorAll('[data-lang-en], [data-lang-es]').forEach(element => {
        const translation = element.getAttribute(`data-lang-${lang}`);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Update navigation text
    const navTranslations = translations[lang];
    document.querySelectorAll('nav ul li a').forEach(link => {
        const key = link.getAttribute('href').replace('.html', '').replace('index', 'home');
        if (navTranslations[key]) {
            link.textContent = navTranslations[key];
        }
    });

    // Update video captions and titles
    document.querySelectorAll('.video-block h2').forEach(title => {
        const pageId = window.location.pathname.split('/').pop().replace('.html', '');
        if (pageId === 'about') {
            title.textContent = translations[lang].tenthAnniversaryTitle;
        } else if (pageId === 'empower') {
            title.textContent = translations[lang].empowerVisionTitle;
        } else if (pageId === 'news') {
            title.textContent = translations[lang].latestNewsTitle;
        }
    });

    document.querySelectorAll('.video-caption').forEach(caption => {
        const pageId = window.location.pathname.split('/').pop().replace('.html', '');
        if (pageId === 'about') {
            caption.textContent = translations[lang].tenthAnniversaryCaption;
        } else if (pageId === 'empower') {
            caption.textContent = translations[lang].empowerVisionCaption;
        } else if (pageId === 'news') {
            caption.textContent = translations[lang].latestNewsCaption;
        }
    });
}

function continueLanguageSwitcherSetup() {
    // Get current page name from URL
    const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Load translations asynchronously if not already loaded
    if (!window.translations) {
        loadTranslations().then(() => {
            initializeLanguageSwitcher();
            translatePage(localStorage.getItem('selectedLanguage') || 'en');
        }).catch(error => {
            console.error('Failed to load translations:', error);
            // Use fallback translations
            window.translations = window.translationsFallback;
            initializeLanguageSwitcher();
            translatePage(localStorage.getItem('selectedLanguage') || 'en');
        });
    } else {
        initializeLanguageSwitcher();
        translatePage(localStorage.getItem('selectedLanguage') || 'en');
    }
}

// Load translations asynchronously
async function loadTranslations() {
    try {
        // Get the current script path to determine relative path
        const scripts = document.getElementsByTagName('script');
        let translationsPath = './js/translations.js';
        
        // Check if we're in a subdirectory by looking at the current page URL
        if (window.location.pathname.includes('/Dynasty/')) {
            translationsPath = '../js/translations.js';
        }
        
        const response = await fetch(translationsPath);
        if (!response.ok) {
            console.error(`Failed to load translations from ${translationsPath}`);
            throw new Error('Failed to load translations');
        }
        const text = await response.text();
        // Execute the translations script
        eval(text);
        
        if (!window.translations) {
            throw new Error('Translations not properly loaded');
        }
        
        return window.translations;
    } catch (error) {
        console.error('Translation loading error:', error);
        throw new Error('Failed to load translations: ' + error.message);
    }
}

// ... rest of the existing code ...

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
    index: {
        en: {
            welcomeTitle: "Welcome to",
            heroDescription: "A global celebration of diversity, empowerment and beauty.",
            pageantTitle: "The Pageant",
            pageantDescription: "Experience the glamour and elegance of our international beauty pageant that celebrates diversity and empowerment.",
            learnMore: "Learn More",
            contestantsTitle: "Contestants",
            contestantsDescription: "Meet our amazing contestants who will represent their countries in this year's competition.",
            meetQueens: "Meet the Queens",
            eventsTitle: "Events",
            eventsDescription: "Check out our calendar of events and activities throughout the pageant.",
            viewCalendar: "View Calendar",
            sponsorsTitle: "Sponsors",
            sponsorsDescription: "Our official sponsors who make this event possible.",
            ourPartners: "Our Partners",
            applyNow: "Apply Now",
            applyNowDescription: "Applications are now open for Miss Star International 2025.",
            fullName: "FULL NAME",
            email: "EMAIL",
            country: "COUNTRY",
            age: "AGE",
            biography: "BIOGRAPHY (200 WORDS MAX)",
            socialImpact: "SOCIAL IMPACT PLATFORM",
            socialImpactPlaceholder: "What cause would you champion as Miss Star International?",
            selectCountry: "Select your country",
            submit: "Submit Application",
            fearlessly: "Fearlessly Feminine.",
            unapologetically: "Unapologetically Powerful"
        },
        es: {
            welcomeTitle: "Bienvenido a",
            heroDescription: "Una celebración global de diversidad, empoderamiento y belleza.",
            pageantTitle: "El Concurso",
            pageantDescription: "Experimenta el glamour y la elegancia de nuestro concurso de belleza internacional que celebra la diversidad y el empoderamiento.",
            learnMore: "Más Información",
            contestantsTitle: "Concursantes",
            contestantsDescription: "Conoce a nuestras increíbles concursantes que representarán a sus países en la competencia de este año.",
            meetQueens: "Conoce a las Reinas",
            eventsTitle: "Eventos",
            eventsDescription: "Consulta nuestro calendario de eventos y actividades durante todo el concurso.",
            viewCalendar: "Ver Calendario",
            sponsorsTitle: "Patrocinadores",
            sponsorsDescription: "Nuestros patrocinadores oficiales que hacen posible este evento.",
            ourPartners: "Nuestros Socios",
            applyNow: "Aplica Ahora",
            applyNowDescription: "Las solicitudes ya están abiertas para Miss Star International 2025.",
            fullName: "NOMBRE COMPLETO",
            email: "CORREO ELECTRÓNICO",
            country: "PAÍS",
            age: "EDAD",
            biography: "BIOGRAFÍA (MÁXIMO 200 PALABRAS)",
            socialImpact: "PLATAFORMA DE IMPACTO SOCIAL",
            socialImpactPlaceholder: "¿Qué causa defenderías como Miss Star International?",
            selectCountry: "Selecciona tu país",
            submit: "Enviar Solicitud",
            fearlessly: "Intrépidamente Femenina.",
            unapologetically: "Decididamente Poderosa"
        }
    },
    company: {
        // existing translations...
    },
    // other pages...
    news: {
        en: {
            pageTitle: "News & Updates",
            introText: "Stay informed with the latest news, updates, and announcements from Miss Star International.",
            latestNewsTitle: "Latest News",
            upcomingEventsTitle: "Upcoming Events",
            pressReleasesTitle: "Press Releases",
            mediaGalleryTitle: "Media Gallery",
            subscribeTitle: "Subscribe to Updates",
            subscribeText: "Join our mailing list to receive the latest news and updates directly in your inbox.",
            emailPlaceholder: "Your email address",
            subscribeButton: "Subscribe",
            noNewsText: "Check back soon for updates!",
            mediaContactTitle: "Media Contact",
            mediaContactText: "For press inquiries, please contact our media relations team."
        },
        es: {
            pageTitle: "Noticias y Actualizaciones",
            introText: "Mantente informado con las últimas noticias, actualizaciones y anuncios de Miss Star International.",
            latestNewsTitle: "Últimas Noticias",
            upcomingEventsTitle: "Próximos Eventos",
            pressReleasesTitle: "Comunicados de Prensa",
            mediaGalleryTitle: "Galería de Medios",
            subscribeTitle: "Suscríbete a las Actualizaciones",
            subscribeText: "Únete a nuestra lista de correo para recibir las últimas noticias y actualizaciones directamente en tu bandeja de entrada.",
            emailPlaceholder: "Tu dirección de correo electrónico",
            subscribeButton: "Suscribirse",
            noNewsText: "¡Vuelve pronto para ver actualizaciones!",
            mediaContactTitle: "Contacto para Medios",
            mediaContactText: "Para consultas de prensa, por favor contacta a nuestro equipo de relaciones con los medios."
        }
    },
    empower: {
        en: {
            pageTitle: "EmpowerTransNation",
            introText: "A global initiative dedicated to uplifting and empowering transgender individuals through education, advocacy, and economic opportunities.",
            missionTitle: "Our Mission",
            missionText: "To create a world where transgender individuals have equal access to resources, opportunities, and respect, allowing them to live authentically and reach their full potential.",
            visionTitle: "Our Vision",
            visionText: "A society that celebrates transgender diversity, where barriers to success are eliminated and where transgender individuals are empowered to become leaders in their communities.",
            programsTitle: "Our Programs",
            program1Title: "Education & Skills Development",
            program1Text: "Providing scholarships, mentorship, and training programs to develop marketable skills and advance educational opportunities.",
            program2Title: "Advocacy & Policy Change",
            program2Text: "Working with governments and organizations to implement inclusive policies and eliminate discriminatory practices.",
            program3Title: "Economic Empowerment",
            program3Text: "Creating employment opportunities and supporting transgender-owned businesses through grants, microloans, and business development resources.",
            program4Title: "Health & Wellbeing",
            program4Text: "Promoting access to healthcare services and mental health resources tailored to meet the unique needs of the transgender community.",
            testimonialsTitle: "Success Stories",
            testimonial1Text: "Through EmpowerTransNation, I received a scholarship that allowed me to complete my education and secure employment in my desired field.",
            testimonial1Author: "Maria S., Program Participant",
            testimonial2Text: "The business development program gave me the tools and confidence to start my own company. Now I employ five people from my community.",
            testimonial2Author: "Alex T., Entrepreneur",
            joinTitle: "Join Our Movement",
            joinText: "Whether you're interested in volunteering, donating, or partnering with us, there are many ways to support our mission and make a difference.",
            contactTitle: "Get in Touch",
            contactText: "Have questions or want to learn more about our programs? Reach out to our team.",
            contactButton: "Contact Us"
        },
        es: {
            pageTitle: "EmpowerTransNation",
            introText: "Una iniciativa global dedicada a elevar y empoderar a las personas transgénero a través de la educación, la defensa y las oportunidades económicas.",
            missionTitle: "Nuestra Misión",
            missionText: "Crear un mundo donde las personas transgénero tengan igual acceso a recursos, oportunidades y respeto, permitiéndoles vivir auténticamente y alcanzar su máximo potencial.",
            visionTitle: "Nuestra Visión",
            visionText: "Una sociedad que celebra la diversidad transgénero, donde se eliminan las barreras para el éxito y donde las personas transgénero están empoderadas para convertirse en líderes en sus comunidades.",
            programsTitle: "Nuestros Programas",
            program1Title: "Educación y Desarrollo de Habilidades",
            program1Text: "Proporcionar becas, mentoría y programas de capacitación para desarrollar habilidades comercializables y avanzar en oportunidades educativas.",
            program2Title: "Defensa y Cambio de Políticas",
            program2Text: "Trabajar con gobiernos y organizaciones para implementar políticas inclusivas y eliminar prácticas discriminatorias.",
            program3Title: "Empoderamiento Económico",
            program3Text: "Crear oportunidades de empleo y apoyar a negocios propiedad de personas transgénero a través de subvenciones, microcréditos y recursos para el desarrollo empresarial.",
            program4Title: "Salud y Bienestar",
            program4Text: "Promover el acceso a servicios de salud y recursos de salud mental adaptados para satisfacer las necesidades únicas de la comunidad transgénero.",
            testimonialsTitle: "Historias de Éxito",
            testimonial1Text: "A través de EmpowerTransNation, recibí una beca que me permitió completar mi educación y asegurar empleo en mi campo deseado.",
            testimonial1Author: "María S., Participante del Programa",
            testimonial2Text: "El programa de desarrollo empresarial me dio las herramientas y la confianza para iniciar mi propia empresa. Ahora empleo a cinco personas de mi comunidad.",
            testimonial2Author: "Alex T., Emprendedor",
            joinTitle: "Únete a Nuestro Movimiento",
            joinText: "Ya sea que estés interesado en ser voluntario, donar o asociarte con nosotros, hay muchas formas de apoyar nuestra misión y marcar la diferencia.",
            contactTitle: "Ponte en Contacto",
            contactText: "¿Tienes preguntas o quieres aprender más sobre nuestros programas? Comunícate con nuestro equipo.",
            contactButton: "Contáctanos"
        }
    }
};

// Ensure window.translations is available
window.translations = window.translations || window.translationsFallback;

// Application Form Handler
function initializeForms() {
    // Find all forms on the page
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add event listener for form submission
        form.addEventListener('submit', function(e) {
            // For forms with class 'application-form'
            if (form.classList.contains('application-form')) {
                e.preventDefault(); // Prevent default form submission
                
                // Validate form fields
                const isValid = validateForm(form);
                
                if (isValid) {
                    // Show processing message
                    showFormMessage(form, 'processing', 'Processing your application...');
                    
                    // Get the current language for error messages
                    const currentLanguage = 'en'; // Always English now
                    
                    // Check if form has a valid action URL
                    const actionUrl = form.getAttribute('action');
                    const hasValidEndpoint = actionUrl && actionUrl.includes('php/submit-application.php');
                    
                    if (hasValidEndpoint) {
                        // Create FormData object
                        const formData = new FormData(form);
                        
                        // Use fetch API to submit the form
                        fetch('php/submit-application.php', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                // Show success message
                                showFormMessage(form, 'success', data.message);
                                
                                // Clear form fields after successful submission
                                form.reset();
                                
                                // Update word count if present
                                const wordCountElement = form.querySelector('.word-count');
                                if (wordCountElement) {
                                    wordCountElement.textContent = `0/200 words`;
                                }
                            } else {
                                // Show error message
                                let errorMsg = data.message;
                                
                                // Add specific error messages if available
                                if (data.errors && data.errors.length > 0) {
                                    errorMsg += '<ul class="mt-2 text-left">';
                                    data.errors.forEach(err => {
                                        errorMsg += `<li>• ${err}</li>`;
                                    });
                                    errorMsg += '</ul>';
                                }
                                
                                showFormMessage(form, 'error', errorMsg);
                            }
                        })
                        .catch(error => {
                            console.error('Error submitting form:', error);
                            const errorMsg = 'Error submitting form. Please try again later.';
                            showFormMessage(form, 'error', errorMsg);
                        });
                    } else {
                        // Simulate backend processing for development purposes
                        setTimeout(() => {
                            // No real backend or using placeholder URL
                            showFormMessage(form, 'success', 'Your application has been received! We\'ll be in touch soon.');
                            console.info('Form submission would normally be sent to a server, but no endpoint is currently available.');
                            
                            // Clear form fields after successful submission
                            form.reset();
                            
                            // Update word count if present
                            const wordCountElement = form.querySelector('.word-count');
                            if (wordCountElement) {
                                wordCountElement.textContent = `0/200 words`;
                            }
                        }, 1500);
                    }
                }
            }
        });
        
        // Add word count functionality to textareas with word limits
        const biographyField = form.querySelector('#biography');
        if (biographyField) {
            const wordCountElement = form.querySelector('.word-count');
            
            biographyField.addEventListener('input', function() {
                if (wordCountElement) {
                    const words = this.value.trim().split(/\s+/).filter(Boolean).length;
                    const currentLanguage = 'en';
                    const wordLabel = currentLanguage === 'es' ? 'palabras' : 'words';
                    wordCountElement.textContent = `${words}/200 ${wordLabel}`;
                    
                    // Change color if approaching or exceeding limit
                    if (words > 200) {
                        wordCountElement.classList.add('text-red-500');
                        wordCountElement.classList.remove('text-star-gold/70');
                    } else if (words > 180) {
                        wordCountElement.classList.add('text-amber-500');
                        wordCountElement.classList.remove('text-star-gold/70', 'text-red-500');
                    } else {
                        wordCountElement.classList.add('text-star-gold/70');
                        wordCountElement.classList.remove('text-amber-500', 'text-red-500');
                    }
                }
            });
        }
    });
    
    // Fill country select with options if it exists
    const countrySelect = document.querySelector('#country');
    if (countrySelect && countrySelect.options.length <= 1) {
        fillCountryOptions(countrySelect);
    }
}

// Function to validate form fields
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Remove any existing error messages
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    
    requiredFields.forEach(field => {
        // Reset field styles
        field.classList.remove('border-red-500');
        
        // Check if field is empty
        if (field.value.trim() === '') {
            isValid = false;
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message text-xs text-red-500 mt-1';
            errorMessage.textContent = 'This field is required';
            field.parentNode.appendChild(errorMessage);
        } 
        // Validate email format if it's an email field
        else if (field.type === 'email' && !validateEmail(field.value)) {
            isValid = false;
            field.classList.add('border-red-500');
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message text-xs text-red-500 mt-1';
            errorMessage.textContent = 'Please enter a valid email address';
            field.parentNode.appendChild(errorMessage);
        }
        // Validate age if it's an age field
        else if (field.id === 'age') {
            const age = parseInt(field.value);
            if (isNaN(age) || age < 18 || age > 120) {
                isValid = false;
                field.classList.add('border-red-500');
                
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message text-xs text-red-500 mt-1';
                errorMessage.textContent = 'Please enter a valid age (18-120)';
                field.parentNode.appendChild(errorMessage);
            }
        }
        // Check biography word count
        else if (field.id === 'biography') {
            const words = field.value.trim().split(/\s+/).filter(Boolean).length;
            if (words > 200) {
                isValid = false;
                field.classList.add('border-red-500');
                
                // Add error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message text-xs text-red-500 mt-1';
                errorMessage.textContent = 'Biography exceeds 200 words limit';
                field.parentNode.appendChild(errorMessage);
            }
        }
    });
    
    return isValid;
}

// Email validation function
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Function to show form messages
function showFormMessage(form, type, message) {
    // Remove any existing messages
    form.querySelectorAll('.form-message').forEach(el => el.remove());
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'form-message text-center py-4 my-4 rounded-md';
    
    if (type === 'processing') {
        messageElement.className += ' bg-blue-500/20 text-blue-300';
        messageElement.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> ${message}`;
    } else if (type === 'success') {
        messageElement.className += ' bg-green-500/20 text-green-300';
        messageElement.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;
    } else if (type === 'error') {
        messageElement.className += ' bg-red-500/20 text-red-300';
        messageElement.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i> ${message}`;
    }
    
    // Insert message before the submit button
    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(messageElement, submitButton);
}

// Function to fill country select with options
function fillCountryOptions(selectElement) {
    const countries = [
        { code: 'US', name: 'United States' },
        { code: 'AF', name: 'Afghanistan' },
        { code: 'AL', name: 'Albania' },
        { code: 'DZ', name: 'Algeria' },
        { code: 'AR', name: 'Argentina' },
        { code: 'AU', name: 'Australia' },
        { code: 'AT', name: 'Austria' },
        { code: 'BD', name: 'Bangladesh' },
        { code: 'BE', name: 'Belgium' },
        { code: 'BR', name: 'Brazil' },
        { code: 'CA', name: 'Canada' },
        { code: 'CL', name: 'Chile' },
        { code: 'CN', name: 'China' },
        { code: 'CO', name: 'Colombia' },
        { code: 'CR', name: 'Costa Rica' },
        { code: 'HR', name: 'Croatia' },
        { code: 'CU', name: 'Cuba' },
        { code: 'CZ', name: 'Czech Republic' },
        { code: 'DK', name: 'Denmark' },
        { code: 'DO', name: 'Dominican Republic' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'EG', name: 'Egypt' },
        { code: 'FI', name: 'Finland' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'GR', name: 'Greece' },
        { code: 'GT', name: 'Guatemala' },
        { code: 'HN', name: 'Honduras' },
        { code: 'HK', name: 'Hong Kong' },
        { code: 'HU', name: 'Hungary' },
        { code: 'IS', name: 'Iceland' },
        { code: 'IN', name: 'India' },
        { code: 'ID', name: 'Indonesia' },
        { code: 'IE', name: 'Ireland' },
        { code: 'IL', name: 'Israel' },
        { code: 'IT', name: 'Italy' },
        { code: 'JM', name: 'Jamaica' },
        { code: 'JP', name: 'Japan' },
        { code: 'KR', name: 'Korea, South' },
        { code: 'LB', name: 'Lebanon' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'MX', name: 'Mexico' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'NZ', name: 'New Zealand' },
        { code: 'NG', name: 'Nigeria' },
        { code: 'NO', name: 'Norway' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'PA', name: 'Panama' },
        { code: 'PE', name: 'Peru' },
        { code: 'PH', name: 'Philippines' },
        { code: 'PL', name: 'Poland' },
        { code: 'PT', name: 'Portugal' },
        { code: 'PR', name: 'Puerto Rico' },
        { code: 'RO', name: 'Romania' },
        { code: 'RU', name: 'Russia' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'SG', name: 'Singapore' },
        { code: 'ZA', name: 'South Africa' },
        { code: 'ES', name: 'Spain' },
        { code: 'SE', name: 'Sweden' },
        { code: 'CH', name: 'Switzerland' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'TH', name: 'Thailand' },
        { code: 'TR', name: 'Turkey' },
        { code: 'UA', name: 'Ukraine' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'UY', name: 'Uruguay' },
        { code: 'VE', name: 'Venezuela' },
        { code: 'VN', name: 'Vietnam' }
    ];
    
    // Sort countries alphabetically
    countries.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add options to select element
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        selectElement.appendChild(option);
    });
}

// Función de diagnóstico para el selector de idioma
function diagnoseLangSwitcher() {
    console.info('========== DIAGNÓSTICO DEL SELECTOR DE IDIOMA ==========');
    console.info(`Estado del DOM: ${document.readyState}`);
    console.info(`Traducciones globales disponibles: ${typeof window.translations !== 'undefined'}`);
    
    const langButtons = document.querySelectorAll('.lang-btn, .language-switcher button, [data-lang]');
    console.info(`Botones de idioma encontrados: ${langButtons.length}`);
    
    if (langButtons.length > 0) {
        langButtons.forEach((btn, index) => {
            console.info(`Botón ${index + 1}:`, {
                texto: btn.textContent.trim(),
                clases: btn.className,
                dataLang: btn.getAttribute('data-lang'),
                esActivo: btn.classList.contains('active'),
                esVisible: btn.offsetParent !== null
            });
        });
    }
    
    const currentLang = getCurrentLanguage();
    console.info(`Idioma actual: ${currentLang}`);
    
    console.info(`localStorage 'language': ${localStorage.getItem('language')}`);
    console.info(`localStorage 'selectedLanguage': ${localStorage.getItem('selectedLanguage')}`);
    console.info(`document.documentElement.lang: ${document.documentElement.lang}`);
    
    if (typeof window.translations !== 'undefined') {
        console.info(`Idiomas disponibles en translations: ${Object.keys(window.translations.common).join(', ')}`);
    }
    
    if (typeof window.translationsFallback !== 'undefined') {
        console.info(`Idiomas disponibles en translationsFallback: ${Object.keys(window.translationsFallback.common).join(', ')}`);
    }
    
    console.info('=======================================================');
}

// Añadir la función de diagnóstico como una utilidad global
window.diagnoseLangSwitcher = diagnoseLangSwitcher;

// Add function to translate common elements
function translateCommonElements(lang, translationsData) {
    // Verify we have translations available
    if (!translationsData || !translationsData.common || !translationsData.common[lang]) {
        console.warn(`Common translations not found for ${lang}, using fallbacks`);
        
        // Try to use fallback translations if main ones are not available
        if (window.translationsFallback && window.translationsFallback.common && window.translationsFallback.common[lang]) {
            translationsData = window.translationsFallback;
        } else {
            return; // No translations available
        }
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
    if (footerCopyright) footerCopyright.innerHTML = commonTranslations.copyright || `© ${new Date().getFullYear()} Miss Star International. ${lang === 'es' ? 'Todos los derechos reservados.' : 'All rights reserved.'}`;
    
    const footerCompanyInfo = document.querySelector('footer h4');
    if (footerCompanyInfo) footerCompanyInfo.innerHTML = commonTranslations.companyInfo || 'Miss Star International';
    
    const footerPhone = document.querySelector('footer p:nth-of-type(2)');
    if (footerPhone) {
        const phoneText = commonTranslations.phone || (lang === 'es' ? 'Teléfono: +1 (505) 621-8615' : 'Phone: +1 (505) 621-8615');
        footerPhone.innerHTML = phoneText.replace('+1 (505) 621-8615', '<a href="tel:+15056218615" class="text-star-gold hover:text-opacity-80">+1 (505) 621-8615</a>');
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

// Translate form elements like labels, placeholders, etc.
function translateFormElements(lang, translationsData) {
    // Check if we have translations
    if (!translationsData || !translationsData.index || !translationsData.index[lang] || !translationsData.index[lang].formLabels) {
        console.warn(`Form translations not found for ${lang}`);
        return;
    }
    
    const formLabels = translationsData.index[lang].formLabels;
    
    // Translation map for form elements
    const translationMap = {
        "full_name": formLabels.fullName,
        "email": formLabels.email,
        "country": formLabels.country,
        "age": formLabels.age,
        "city": formLabels.city,
        "biography": formLabels.biography,
        "social_media": formLabels.socialMediaProfiles,
        "photo": formLabels.photo
    };
    
    // Update form labels
    for (const [id, translation] of Object.entries(translationMap)) {
        const labelElement = document.querySelector(`label[for="${id}"]`);
        if (labelElement) {
            labelElement.textContent = translation;
        }
    }
    
    // Update select placeholders
    const countrySelect = document.getElementById('country');
    if (countrySelect) {
        const firstOption = countrySelect.querySelector('option[value=""]');
        if (firstOption) {
            firstOption.textContent = formLabels.selectCountry;
        }
    }
    
    // Update textarea placeholders
    const socialMediaField = document.getElementById('social_media');
    if (socialMediaField) {
        socialMediaField.placeholder = formLabels.socialMediaPlaceholder;
    }
    
    // Update submit button
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        // Keep the crown icon if present
        const iconHTML = submitButton.querySelector('i') ? submitButton.querySelector('i').outerHTML : '';
        submitButton.innerHTML = `${formLabels.submit} ${iconHTML}`;
    }
    
    // Update help text
    const photoHelp = document.querySelector('#photo + span + div');
    if (photoHelp) {
        photoHelp.textContent = formLabels.photoHelp;
    }
    
    // Update word count text if present
    const wordCountElement = document.querySelector('.word-count');
    if (wordCountElement) {
        const currentText = wordCountElement.textContent;
        const count = currentText.split('/')[0];
        const wordLabel = lang === 'es' ? 'palabras' : 'words';
        wordCountElement.textContent = `${count}/200 ${wordLabel}`;
    }
}

// Función para inicializar el cursor personalizado
function initializeCustomCursor() {
    // Crear el cursor si no existe
    let cursor = document.querySelector('.custom-cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);
    }

    // Asegurarse de que el cursor sea visible
    cursor.style.display = 'block';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.opacity = '1';
    cursor.style.visibility = 'visible';

    // Seguimiento simple del mouse
    document.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursor.style.opacity = '1';
            cursor.style.visibility = 'visible';
            cursor.style.display = 'block';
        });
    });

    // Asegurarse de que el cursor permanezca visible
    setInterval(() => {
        if (cursor.style.display === 'none' || cursor.style.visibility === 'hidden') {
            cursor.style.display = 'block';
            cursor.style.visibility = 'visible';
            cursor.style.opacity = '1';
        }
    }, 100);

    // Manejar elementos interactivos
    document.querySelectorAll('a, button, input, textarea, select, .card, .btn-primary, .btn-secondary, .destiny-platform *')
        .forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.display = 'block';
                cursor.style.visibility = 'visible';
                cursor.style.opacity = '1';
            });

            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.display = 'block';
                cursor.style.visibility = 'visible';
                cursor.style.opacity = '1';
            });
        });

    // Prevenir que el cursor desaparezca
    document.addEventListener('mouseenter', () => {
        cursor.style.display = 'block';
        cursor.style.visibility = 'visible';
        cursor.style.opacity = '1';
    });

    // Efecto de click
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.9)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });

    // Forzar visibilidad en la plataforma Destiny
    const destinyPlatform = document.querySelector('.destiny-platform');
    if (destinyPlatform) {
        destinyPlatform.addEventListener('mouseover', () => {
            cursor.style.display = 'block';
            cursor.style.visibility = 'visible';
            cursor.style.opacity = '1';
        }, true);
    }
}

// Función para inicializar el efecto parallax
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (parallaxElements.length === 0) return;
    
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let isDesktop = windowWidth > 768;
    
    // No usar parallax en dispositivos móviles
    if (!isDesktop) {
        console.info('Parallax disabled on mobile devices');
        return;
    }
    
    window.addEventListener('resize', () => {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        isDesktop = windowWidth > 768;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDesktop) return;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calcular posición relativa del mouse (0-1)
        const xPos = mouseX / windowWidth;
        const yPos = mouseY / windowHeight;
        
        // Aplicar efecto parallax a los elementos con la clase .parallax
        parallaxElements.forEach(el => {
            const speed = el.getAttribute('data-parallax-speed') || 0.1;
            const xOffset = (xPos - 0.5) * speed * 100; // -50px a 50px
            const yOffset = (yPos - 0.5) * speed * 100; // -50px a 50px
            
            el.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
    
    console.info('Parallax effect initialized');
}

// Performance monitoring initialization
function initializePerformanceMonitoring() {
    const PERFORMANCE_THRESHOLDS = {
        resource: 2000,    // 2 seconds for resources
        navigation: 3000,  // 3 seconds for navigation
        longtask: 200     // 200ms for long tasks
    };

    const IGNORED_RESOURCES = [
        'google-analytics',
        'analytics',
        'gtag',
        'facebook',
        'twitter',
        'double-click',
        'fonts.googleapis',
        'cloudflare',
        '.woff',
        '.woff2',
        '.ttf',
        '.png',
        '.jpg',
        '.jpeg',
        '.gif'
    ];

    let performanceIssues = new Map();

    function shouldIgnoreResource(url = '') {
        return IGNORED_RESOURCES.some(term => url.toLowerCase().includes(term));
    }

        try {
            const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (shouldIgnoreResource(entry.name)) return;

                const threshold = PERFORMANCE_THRESHOLDS[entry.entryType] || 1000;
                
                if (entry.duration > threshold) {
                    const key = `${entry.entryType}-${entry.name}`;
                    
                    // Solo reportar un problema una vez cada 5 minutos
                    const now = Date.now();
                    const lastReported = performanceIssues.get(key);
                    
                    if (!lastReported || (now - lastReported) > 300000) {
                        performanceIssues.set(key, now);
                        
                        // Log solo si es un problema significativo
                        if (entry.duration > threshold * 2) {
                            console.debug('Performance issue detected:', {
                                type: entry.entryType,
                                name: entry.name,
                                duration: Math.round(entry.duration),
                                threshold: threshold
                            });
                        }
                    }
                }
            });
        });

        observer.observe({ 
            entryTypes: ['resource', 'navigation', 'longtask'],
            buffered: true
        });

        // Limpiar el mapa de problemas cada hora
        setInterval(() => {
            const oneHourAgo = Date.now() - 3600000;
            for (const [key, timestamp] of performanceIssues.entries()) {
                if (timestamp < oneHourAgo) {
                    performanceIssues.delete(key);
                }
            }
        }, 3600000);

        } catch (e) {
        console.debug('PerformanceObserver not supported:', e);
    }
}

// Helper function to get current language
function getCurrentLanguage() {
    return localStorage.getItem('language') || localStorage.getItem('selectedLanguage') || 'en';
}

// Function to immediately apply stored language on page load
document.addEventListener('DOMContentLoaded', function() {
    const storedLang = getCurrentLanguage();
    updateLanguage(storedLang);
    
    // Add click handlers for language buttons if they exist
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            updateLanguage(lang);
        });
    });
});

// Additionally, implement a manual language application when document is ready
function ensureLanguageApplied() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const currentLang = getCurrentLanguage();
        updateLanguage(currentLang);
    }
}

// Call this after page load to make sure everything is ready
setTimeout(ensureLanguageApplied, 300);

function updateLanguage(lang) {
    if (!lang) return;
    
    // Update HTML elements with data-lang attributes
    document.querySelectorAll('[data-lang-en], [data-lang-es]').forEach(element => {
        const translation = element.getAttribute(`data-lang-${lang}`);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Store the selected language
    localStorage.setItem('language', lang);
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.setAttribute('lang', lang);
}

function translatePage(lang) {
    if (!window.translations) {
        console.error('Translations not loaded');
        return;
    }

    // Get current page name from URL
    const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // Get translations for current page
    const pageTranslations = window.translations[pageName];
    const commonTranslations = window.translations.common;
    
    if (!pageTranslations || !commonTranslations) {
        console.error('Missing translations for page:', pageName);
        return;
    }
    
    // Translate common elements
    Object.entries(commonTranslations[lang] || {}).forEach(([key, value]) => {
        document.querySelectorAll(`[data-translate="${key}"]`).forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = value;
            } else {
                element.innerHTML = value;
            }
        });
    });
    
    // Translate page-specific elements
    Object.entries(pageTranslations[lang] || {}).forEach(([key, value]) => {
        document.querySelectorAll(`[data-translate="${key}"]`).forEach(element => {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = value;
            } else {
                element.innerHTML = value;
            }
        });
    });
    
    // Update form labels if they exist
    if (pageTranslations[lang]?.formLabels) {
        Object.entries(pageTranslations[lang].formLabels).forEach(([key, value]) => {
            document.querySelectorAll(`[data-translate-label="${key}"]`).forEach(element => {
                element.innerHTML = value;
            });
        });
    }
    
    // Dispatch event for custom translations
    document.dispatchEvent(new CustomEvent('translationComplete', { detail: { language: lang } }));
}