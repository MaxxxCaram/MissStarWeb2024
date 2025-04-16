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
    
    // Términos a filtrar
    const termsToFilter = [
        '[Intervention]',
        'Images loaded lazily',
        'Load events are deferred',
        'www.missstarinternational.com',
        'go.microsoft.com/fwlink',
        'Failed to execute',
        'querySelectorAll'
    ];
    
    // Reemplazar la función console.warn
    console.warn = function(...args) {
        // Verificar si el mensaje contiene alguno de los términos a filtrar
        if (args.length > 0 && typeof args[0] === 'string') {
            const message = args[0];
            if (termsToFilter.some(term => message.includes(term))) {
                return; // No mostrar estas advertencias
            }
        }
        
        // Pasar el resto de advertencias a la función original
        return originalConsoleWarn.apply(this, args);
    };
    
    // También filtrar algunos errores conocidos que no afectan la funcionalidad
    console.error = function(...args) {
        // Filtrar errores de sintaxis de selector que ya manejamos
        if (args.length > 0 && typeof args[0] === 'string' && 
            (args[0].includes('Failed to execute') && args[0].includes('querySelectorAll'))) {
            return; // No mostrar estos errores
        }
        
        // Pasar el resto de errores a la función original
        return originalConsoleError.apply(this, args);
    };
    
    console.log('Console warning filter initialized for Microsoft Edge');
})();

// Main initialization 
document.addEventListener('DOMContentLoaded', function() {
    console.info('Inicializando componentes de la página...');
    
    // Asegurarse de que las traducciones estén disponibles antes de inicializar el selector de idioma
    if (typeof translations === 'undefined') {
        console.info('Traducciones no disponibles, cargando dinámicamente...');
        // Código de carga ya existe en la parte superior del archivo, solo esperamos a que termine
    } else {
        console.info('Traducciones disponibles, inicializando selector de idioma...');
        // Initialize language switcher first to ensure translations load before other components
        setTimeout(function() {
            initializeLanguageSwitcher();
        }, 100); // Pequeño retraso para asegurar que los elementos DOM estén listos
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

// Mobile Menu
function initializeMobileMenu() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!menuButton || !mobileMenu) {
        console.info('Mobile menu elements not found, creating them automatically');
        
        // Create mobile menu button if it doesn't exist
        if (!menuButton) {
            const nav = document.querySelector('nav');
            if (nav) {
                const menuButtonEl = document.createElement('button');
                menuButtonEl.className = 'mobile-menu-button lg:hidden';
                menuButtonEl.setAttribute('aria-label', 'Toggle menu');
                menuButtonEl.innerHTML = '<i class="fas fa-bars text-white text-2xl"></i>';
                nav.appendChild(menuButtonEl);
            }
        }
        
        // Create mobile menu if it doesn't exist
        if (!mobileMenu) {
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
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = link.href;
                        a.textContent = link.textContent;
                        a.className = 'text-white hover:text-star-gold transition-colors';
                        li.appendChild(a);
                        mobileNav.appendChild(li);
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
    }
    
    // Re-query for elements in case they were just created
    const menuButtonUpdated = document.querySelector('.mobile-menu-button');
    const mobileMenuUpdated = document.querySelector('.mobile-menu');
    const closeButton = mobileMenuUpdated ? mobileMenuUpdated.querySelector('button[aria-label="Close menu"]') : null;
    
    if (menuButtonUpdated && mobileMenuUpdated) {
        menuButtonUpdated.addEventListener('click', () => {
            mobileMenuUpdated.classList.toggle('hidden');
            mobileMenuUpdated.classList.toggle('translate-x-full');
            document.body.classList.toggle('overflow-hidden');
        });
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                mobileMenuUpdated.classList.add('hidden');
                mobileMenuUpdated.classList.add('translate-x-full');
                document.body.classList.remove('overflow-hidden');
            });
        }
        
        // Close menu when clicking on a link
        const mobileLinks = mobileMenuUpdated.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuUpdated.classList.add('hidden');
                mobileMenuUpdated.classList.add('translate-x-full');
                document.body.classList.remove('overflow-hidden');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenuUpdated.classList.contains('hidden')) return;
            
            if (!mobileMenuUpdated.contains(e.target) && e.target !== menuButtonUpdated) {
                mobileMenuUpdated.classList.add('hidden');
                mobileMenuUpdated.classList.add('translate-x-full');
                document.body.classList.remove('overflow-hidden');
            }
        });
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
    // Buscar botones de idioma utilizando selectores más amplios primero
    let langButtons = document.querySelectorAll('.language-switcher button, [data-lang], button[data-lang]');
    
    if (!langButtons || langButtons.length === 0) {
        langButtons = document.querySelectorAll('.lang-btn');
        console.info(`Buscando botones de idioma con selectores alternativos... encontrados: ${langButtons.length}`);
    }
    
    // Búsqueda extendida para encontrar botones de idioma por texto
    if (!langButtons || langButtons.length === 0) {
        const allButtons = document.querySelectorAll('button, a');
        const langButtonsArray = [];
        
        allButtons.forEach(button => {
            const text = button.textContent.trim().toLowerCase();
            if (text === 'en' || text === 'es' || text === 'english' || text === 'español') {
                langButtonsArray.push(button);
            }
        });
        
        if (langButtonsArray.length > 0) {
            langButtons = langButtonsArray;
            console.info(`Encontrados ${langButtons.length} botones de idioma por texto`);
        } else {
            console.info('No se encontraron botones de idioma por texto');
        }
    }
    
    // Si aún no hay botones, crearlos automáticamente
    if (!langButtons || langButtons.length === 0) {
        console.info('No language buttons found, creating them automatically');
        
        // Encontrar un buen lugar para insertar los botones (preferiblemente en el nav)
        const navElement = document.querySelector('nav ul, nav, header');
        
        if (navElement) {
            // Crear contenedor para los botones
            const langSwitcher = document.createElement('div');
            langSwitcher.className = 'language-switcher flex items-center space-x-2 ml-4';
            
            // Crear botón para inglés
            const enBtn = document.createElement('button');
            enBtn.className = 'lang-btn px-2 py-1 rounded-md text-sm';
            enBtn.setAttribute('data-lang', 'en');
            enBtn.textContent = 'EN';
            
            // Crear botón para español
            const esBtn = document.createElement('button');
            esBtn.className = 'lang-btn px-2 py-1 rounded-md text-sm';
            esBtn.setAttribute('data-lang', 'es');
            esBtn.textContent = 'ES';
            
            // Añadir botones al contenedor
            langSwitcher.appendChild(enBtn);
            langSwitcher.appendChild(esBtn);
            
            // Añadir contenedor a la navegación
            if (navElement.tagName === 'UL') {
                // Si es una lista, crear un elemento de lista
                const li = document.createElement('li');
                li.className = 'language-switcher-container';
                li.appendChild(langSwitcher);
                navElement.appendChild(li);
            } else {
                // Si no, añadirlo directamente
                navElement.appendChild(langSwitcher);
            }
            
            // Actualizar la lista de botones
            langButtons = document.querySelectorAll('.lang-btn');
            console.info(`Created language buttons automatically, total: ${langButtons.length}`);
        } else {
            console.warn('No suitable container found for language buttons, skipping language switcher initialization');
            return;
        }
    }
    
    console.info(`Found ${langButtons.length} language buttons, initializing...`);
    
    // Ensure translations are available globally
    if (typeof translations !== 'undefined' && !window.translations) {
        window.translations = translations;
        console.info('Made translations available globally');
    }
    
    // Check if translations are available from any source
    if (typeof translations === 'undefined' && !window.translations) {
        console.warn('Translations object not found. Make sure translations.js is loaded before main.js');
        // Initialize with fallback translations if main translations are missing
        window.translations = window.translationsFallback || {
            common: {
                en: { home: "Home" },
                es: { home: "Inicio" }
            }
        };
        console.info('Using fallback translations since main translations not found');
    }
    
    // Detect browser language if no language is saved
    const savedLanguage = localStorage.getItem('language') || localStorage.getItem('selectedLanguage');
    let currentLang = savedLanguage;
    
    if (!currentLang) {
        currentLang = detectBrowserLanguage();
        console.info(`No saved language found, detected browser language: ${currentLang}`);
        localStorage.setItem('language', currentLang);
        localStorage.setItem('selectedLanguage', currentLang);
    } else {
        console.info(`Using saved language preference: ${currentLang}`);
    }
    
    // Initialize with saved/detected language
    updateLanguage(currentLang);

    // Set active state on the current language button
    setActiveLanguageButton(currentLang);
    
    // Add click event listeners to language buttons
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Intentar obtener el idioma del atributo data-lang, o del texto del botón
            const lang = this.getAttribute('data-lang') || 
                         (this.textContent.trim().toLowerCase() === 'español' || this.textContent.trim().toLowerCase() === 'es' ? 'es' : 'en');
            
            if (!lang) {
                console.error('Language button missing data-lang attribute and could not determine language from text');
                return;
            }
            
            if (lang === currentLang) {
                console.info(`Language ${lang} already selected`);
                return;
            }
            
            // Save language preference to localStorage
            localStorage.setItem('language', lang);
            localStorage.setItem('selectedLanguage', lang);
            currentLang = lang;
            
            // Update language field in application form if exists
            const languageField = document.querySelector('form input[name="language"]');
            if (languageField) {
                languageField.value = lang;
            }
            
            // Update active button state
            setActiveLanguageButton(lang);
            
            // Update content based on language
            updateLanguage(lang);
        });
    });
    
    // Function to set active state on language button
    function setActiveLanguageButton(lang) {
        langButtons.forEach(btn => {
            const btnLang = btn.getAttribute('data-lang') || 
                           (btn.textContent.trim().toLowerCase() === 'español' || btn.textContent.trim().toLowerCase() === 'es' ? 'es' : 'en');
            
            if (btnLang === lang) {
                btn.classList.add('lang-active', 'active');
                btn.setAttribute('aria-pressed', 'true');
                
                // Añadir estilos de apariencia activa si no hay CSS para eso
                btn.style.fontWeight = 'bold';
                btn.style.color = '#ffffff';
                btn.style.borderBottom = '2px solid currentColor';
            } else {
                btn.classList.remove('lang-active', 'active');
                btn.setAttribute('aria-pressed', 'false');
                
                // Reiniciar estilos
                btn.style.fontWeight = 'normal';
                btn.style.color = '#cccccc';
                btn.style.borderBottom = 'none';
            }
        });
    }
    
    console.info(`Language switcher initialized with language: ${currentLang}`);
    console.info(`Language buttons found: ${langButtons.length}`);

    // Dispatch event to notify the system that language switcher is ready
    document.dispatchEvent(new CustomEvent('languageSwitcherReady', { 
        detail: { language: currentLang }
    }));
}

// Helper function to detect browser language
function detectBrowserLanguage() {
    // Get browser language preference 
    let browserLang = navigator.language || navigator.userLanguage;
    
    // Extract main language code (e.g., 'en-US' -> 'en')
    if (browserLang) {
        browserLang = browserLang.split('-')[0].toLowerCase();
    }
    
    // Only support 'en' and 'es' for now
    if (browserLang === 'es') {
        return 'es';
    }
    
    // Default to English for any other language
    return 'en';
}

// Function to update content based on language
function updateLanguage(lang) {
    if (!lang || (lang !== 'en' && lang !== 'es')) {
        console.error(`Invalid language code: ${lang}, defaulting to English`);
        lang = 'en';
    }
    
    console.log(`Updating content to language: ${lang}`);
    
    try {
        // Determine current page for targeted translations
        const currentPage = getCurrentPage();
        console.log(`Current page identified as: ${currentPage}`);
        
        // Ensure translations are available in the global space
        const translationsData = window.translations || window.translationsFallback;
        
        // Set the document language
        document.documentElement.lang = lang;
        
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

        // Translate common elements across all pages first
        if (translationsData && typeof translateCommonElements === 'function') {
            translateCommonElements(lang, translationsData);
        }
        
        // Handle form labels and placeholders
        if (typeof translateFormElements === 'function') {
            translateFormElements(lang, translationsData);
        }
        
        // Debug and log available translation keys
        console.log(`Available translation keys: ${translationsData ? Object.keys(translationsData).join(', ') : 'none'}`);
        console.log(`Current page '${currentPage}' has translations: ${translationsData && translationsData[currentPage] ? 'yes' : 'no'}`);
        
        // Call page-specific translation function with correct order of parameters
        // If current page is not in translations, try to use generic translations
        if (currentPage && translationsData[currentPage]) {
            translatePageContent(currentPage, lang, translationsData);
        } else if (currentPage === 'index' || !currentPage) {
            // Use index translations for home page or unknown pages
            translatePageContent('index', lang, translationsData);
        } else {
            console.warn(`No translations found for page: ${currentPage}, using common translations only`);
        }
        
        // Dispatch custom event for other components that might need to react to language change
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
    } catch (error) {
        console.error('Error updating language:', error);
    }
}

// Helper function to get current page identifier
function getCurrentPage() {
    const path = window.location.pathname;
    let filename = path.split('/').pop() || 'index.html';
    
    // Handle URLs with query parameters
    if (filename.includes('?')) {
        filename = filename.split('?')[0];
    }
    
    // Handle URLs without file extension
    if (!filename.includes('.')) {
        // Check if it's the root (empty or /)
        if (filename === '' || filename === '/') {
            return 'index';
        }
        return filename;
    }
    
    // Handle empty filename (happens on some servers)
    if (!filename) {
        return 'index';
    }
    
    // Remove file extension to match translation object keys
    return filename.replace('.html', '') || 'index';
}

// Update the page-specific translation function to use external translations
function translatePageContent(pageName, lang, translationsData) {
    console.log(`Translating ${pageName} page to ${lang}`);
    
    // Intentar obtener traducciones de diferentes fuentes
    let pageTranslations = null;
    
    // Primero, intentar desde el parámetro translationsData
    if (translationsData && translationsData[pageName] && translationsData[pageName][lang]) {
        pageTranslations = translationsData[pageName][lang];
        console.log("Using translationsData from parameter");
    } 
    // Segundo, intentar desde window.translations
    else if (window.translations && window.translations[pageName] && window.translations[pageName][lang]) {
        pageTranslations = window.translations[pageName][lang];
        console.log("Using window.translations");
    }
    // Tercero, intentar desde objeto global translations
    else if (typeof translations !== 'undefined' && translations[pageName] && translations[pageName][lang]) {
        pageTranslations = translations[pageName][lang];
        console.log("Using global translations variable");
    }
    // Cuarto, usar fallback
    else if (window.translationsFallback && window.translationsFallback[pageName] && window.translationsFallback[pageName][lang]) {
        pageTranslations = window.translationsFallback[pageName][lang];
        console.log("Using fallback translations");
    }
    
    // Si aún no tenemos traducciones, verificar si tenemos traducciones para el idioma en general
    if (!pageTranslations && window.translationsFallback && window.translationsFallback[lang]) {
        pageTranslations = window.translationsFallback[lang];
        console.log("Using generic language fallback");
    }
    
    // Si aún no tenemos traducciones, usar el fallback en inglés como último recurso
    if (!pageTranslations && window.translationsFallback && window.translationsFallback.en) {
        pageTranslations = window.translationsFallback.en;
        console.log("Using English fallback as last resort");
    }
    
    // Si aún no tenemos traducciones, intentar usar las de la página principal
    if (!pageTranslations) {
        if (translationsData && translationsData['index'] && translationsData['index'][lang]) {
            pageTranslations = translationsData['index'][lang];
            console.log("Using index page translations as fallback");
        } else {
            console.warn(`Translations not found for page ${pageName} in ${lang}`);
            return;
        }
    }
    
    // Translate all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (pageTranslations[key]) {
            element.innerHTML = pageTranslations[key];
        }
    });
    
    // Handle page-specific translations based on page name
    try {
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
            case 'news':
                translateNewsPage(pageTranslations);
                break;
            default:
                // For pages without specific translation functions, 
                // try to use common translation patterns
                translateGenericPage(pageTranslations);
                break;
        }
    } catch (error) {
        console.error(`Error translating page ${pageName}:`, error);
    }
}

// Function to translate generic pages without specific functions
function translateGenericPage(translations) {
    if (!translations) {
        console.warn('No translations provided for generic page');
        return;
    }
    
    // Try to translate common page elements by convention
    
    // Page title
    const pageTitle = document.querySelector('.page-header h1, .page-title, h1.title');
    if (pageTitle && translations.pageTitle) pageTitle.textContent = translations.pageTitle;
    
    // Introduction text
    const introText = document.querySelector('.intro-text, .intro p, .introduction');
    if (introText && translations.introText) introText.textContent = translations.introText;
    
    // Section titles (try to find by convention)
    document.querySelectorAll('h2, .section-title').forEach((title, index) => {
        const key = `section${index + 1}Title`;
        if (translations[key]) {
            title.textContent = translations[key];
        }
    });
    
    // Section content (paragraphs)
    document.querySelectorAll('section p, .section-content p').forEach((paragraph, index) => {
        const key = `section${index + 1}Content`;
        if (translations[key]) {
            paragraph.textContent = translations[key];
        }
    });
    
    // Try to translate buttons
    document.querySelectorAll('button, .btn, .btn-primary, .btn-secondary').forEach((button, index) => {
        const key = `button${index + 1}`;
        if (translations[key]) {
            // Keep any icons if present
            const iconHTML = button.innerHTML.match(/<i[^>]*><\/i>/) || '';
            button.innerHTML = translations[key] + ' ' + iconHTML;
        }
    });
    
    console.log('Applied generic translations to page elements');
}

// Page-specific translation functions
function translateIndexPage(translations) {
    if (!translations) {
        console.warn('No translations provided for index page');
        return;
    }
    
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
    const pageantTitle = document.querySelector('#pageant .section-title');
    if (pageantTitle) pageantTitle.textContent = translations.pageantTitle || "The Pageant";
    
    const pageantDescription = document.querySelector('#pageant .section-content p');
    if (pageantDescription) pageantDescription.textContent = translations.pageantDescription || "Experience the glamour and elegance of our international beauty pageant that celebrates diversity and empowerment.";
    
    const pageantButton = document.querySelector('#pageant .btn-primary');
    if (pageantButton) {
        const iconHTML = pageantButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        pageantButton.innerHTML = (translations.learnMore || "Learn More") + ' ' + iconHTML;
    }
    
    // Contestants section
    const contestantsTitle = document.querySelector('#contestants .section-title');
    if (contestantsTitle) contestantsTitle.textContent = translations.contestantsTitle || "Contestants";
    
    const contestantsDescription = document.querySelector('#contestants .section-content p');
    if (contestantsDescription) contestantsDescription.textContent = translations.contestantsDescription || "Meet our amazing contestants who will represent their countries in this year's competition.";
    
    const contestantsButton = document.querySelector('#contestants .btn-primary');
    if (contestantsButton) {
        const iconHTML = contestantsButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        contestantsButton.innerHTML = (translations.meetQueens || "Meet the Queens") + ' ' + iconHTML;
    }
    
    // Events section
    const eventsTitle = document.querySelector('#events .section-title');
    if (eventsTitle) eventsTitle.textContent = translations.eventsTitle || "Events";
    
    const eventsDescription = document.querySelector('#events .section-content p');
    if (eventsDescription) eventsDescription.textContent = translations.eventsDescription || "Check out our calendar of events and activities throughout the pageant.";
    
    const eventsButton = document.querySelector('#events .btn-primary');
    if (eventsButton) {
        const iconHTML = eventsButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        eventsButton.innerHTML = (translations.viewCalendar || "View Calendar") + ' ' + iconHTML;
    }
    
    // Sponsors section
    const sponsorsTitle = document.querySelector('#sponsors .section-title');
    if (sponsorsTitle) sponsorsTitle.textContent = translations.sponsorsTitle || "Sponsors";
    
    const sponsorsDescription = document.querySelector('#sponsors .section-content p');
    if (sponsorsDescription) sponsorsDescription.textContent = translations.sponsorsDescription || "Our official sponsors who make this event possible.";
    
    const sponsorsButton = document.querySelector('#sponsors .btn-primary');
    if (sponsorsButton) {
        const iconHTML = sponsorsButton.innerHTML.match(/<i[^>]*><\/i>/) || '';
        sponsorsButton.innerHTML = (translations.ourPartners || "Our Partners") + ' ' + iconHTML;
    }
    
    // Special text elements
    const fearlessText = document.querySelector('.text-5xl .glow-text:nth-child(1)');
    if (fearlessText) {
        fearlessText.textContent = translations.fearlessly || "Fearlessly Feminine.";
    }
    
    const unapologeticallyText = document.querySelector('.text-5xl .glow-text:nth-child(2)');
    if (unapologeticallyText) {
        unapologeticallyText.textContent = translations.unapologetically || "Unapologetically Powerful";
    }
}

function translateCompanyPage(translations) {
    if (!translations) {
        console.warn('No translations provided for company page');
        return;
    }
    
    // Page title and introduction
    const pageTitle = document.querySelector('.page-header h1');
    if (pageTitle) pageTitle.textContent = translations.pageTitle || "The Company";
    
    const introText = document.querySelector('.intro-section p');
    if (introText) introText.textContent = translations.introText || "";
    
    // Values section
    const valuesTitle = document.querySelector('.values-section h2');
    if (valuesTitle) valuesTitle.textContent = translations.valuesTitle || "Our Values";
    
    // Values cards
    const inclusivityTitle = document.querySelector('.values-card:nth-child(1) h3');
    if (inclusivityTitle) inclusivityTitle.textContent = translations.inclusivityTitle || "Inclusivity";
    
    const inclusivityText = document.querySelector('.values-card:nth-child(1) p');
    if (inclusivityText) inclusivityText.textContent = translations.inclusivityText || "";
    
    const empowermentTitle = document.querySelector('.values-card:nth-child(2) h3');
    if (empowermentTitle) empowermentTitle.textContent = translations.empowermentTitle || "Empowerment";
    
    const empowermentText = document.querySelector('.values-card:nth-child(2) p');
    if (empowermentText) empowermentText.textContent = translations.empowermentText || "";
    
    const excellenceTitle = document.querySelector('.values-card:nth-child(3) h3');
    if (excellenceTitle) excellenceTitle.textContent = translations.excellenceTitle || "Excellence";
    
    const excellenceText = document.querySelector('.values-card:nth-child(3) p');
    if (excellenceText) excellenceText.textContent = translations.excellenceText || "";
    
    const innovationTitle = document.querySelector('.values-card:nth-child(4) h3');
    if (innovationTitle) innovationTitle.textContent = translations.innovationTitle || "Innovation";
    
    const innovationText = document.querySelector('.values-card:nth-child(4) p');
    if (innovationText) innovationText.textContent = translations.innovationText || "";
    
    // Mission and vision
    const missionTitle = document.querySelector('.mission-section h2');
    if (missionTitle) missionTitle.textContent = translations.missionTitle || "Our Mission";
    
    const missionText = document.querySelector('.mission-section p');
    if (missionText) missionText.textContent = translations.missionText || "";
    
    const visionTitle = document.querySelector('.vision-section h2');
    if (visionTitle) visionTitle.textContent = translations.visionTitle || "Our Vision";
    
    const visionText = document.querySelector('.vision-section p');
    if (visionText) visionText.textContent = translations.visionText || "";
}

function translateAboutPage(translations) {
    if (!translations) {
        console.warn('No translations provided for about page');
        return;
    }
    
    // Page title and introduction
    const pageTitle = document.querySelector('.page-header h1');
    if (pageTitle) pageTitle.textContent = translations.pageTitle || "About Us";
    
    const introText = document.querySelector('.intro-section p');
    if (introText) introText.textContent = translations.introText || "";
    
    // Founder section
    const founderTitle = document.querySelector('.founder-section h2');
    if (founderTitle) founderTitle.textContent = translations.founderTitle || "";
    
    const founderPosition = document.querySelector('.founder-position');
    if (founderPosition) founderPosition.textContent = translations.founderPosition || "";
    
    const founderBio = document.querySelector('.founder-bio');
    if (founderBio) founderBio.textContent = translations.founderBio || "";
    
    // Achievements section
    const achievementsTitle = document.querySelector('.achievements-section h2');
    if (achievementsTitle) achievementsTitle.textContent = translations.achievementsTitle || "Key Achievements";
    
    const achievementsText = document.querySelector('.achievements-section p');
    if (achievementsText) achievementsText.textContent = translations.achievementsText || "";
    
    // Impact section
    const impactTitle = document.querySelector('.impact-section h2');
    if (impactTitle) impactTitle.textContent = translations.impactTitle || "Global Impact";
    
    const impactText = document.querySelector('.impact-section p');
    if (impactText) impactText.textContent = translations.impactText || "";
    
    // Vision & Values section
    const visionValuesTitle = document.querySelector('.vision-values-section h2');
    if (visionValuesTitle) visionValuesTitle.textContent = translations.visionValuesTitle || "Vision & Values";
    
    const visionValuesText = document.querySelector('.vision-values-section p');
    if (visionValuesText) visionValuesText.textContent = translations.visionValuesText || "";
    
    // Mayor recommendation section
    const mayorRecommendationTitle = document.querySelector('.mayor-recommendation h2');
    if (mayorRecommendationTitle) mayorRecommendationTitle.textContent = translations.mayorRecommendationTitle || "Official Recommendation from the Mayor of Santa Susanna";
    
    // Translate mayor recommendation paragraphs if they exist
    const mayorRecommendationTexts = document.querySelectorAll('.mayor-recommendation p');
    if (mayorRecommendationTexts && mayorRecommendationTexts.length >= 4) {
        if (translations.mayorRecommendationText1) 
            mayorRecommendationTexts[0].textContent = translations.mayorRecommendationText1;
        if (translations.mayorRecommendationText2) 
            mayorRecommendationTexts[1].textContent = translations.mayorRecommendationText2;
        if (translations.mayorRecommendationText3) 
            mayorRecommendationTexts[2].textContent = translations.mayorRecommendationText3;
        if (translations.mayorRecommendationText4) 
            mayorRecommendationTexts[3].textContent = translations.mayorRecommendationText4;
    }
    
    const mayorName = document.querySelector('.mayor-name');
    if (mayorName) mayorName.textContent = translations.mayorName || "Joan Campolier i Montsant";
    
    const mayorPosition = document.querySelector('.mayor-position');
    if (mayorPosition) mayorPosition.textContent = translations.mayorPosition || "Mayor of Santa Susanna City Council";
}

function translateConsortiumPage(translations) {
    if (!translations) {
        console.warn('No translations provided for consortium page');
        return;
    }
    
    // Page title
    const pageTitle = document.querySelector('.consortium-section h1, .page-header h1');
    if (pageTitle) pageTitle.textContent = translations.pageTitle || "Miss Star Consortium";
    
    // Intro text
    const introText = document.querySelector('.consortium-intro p, .intro-section p');
    if (introText) introText.textContent = translations.introText || "";
    
    // Vision section
    const visionTitle = document.querySelector('.vision-section h2');
    if (visionTitle) visionTitle.textContent = translations.visionTitle || "Our Vision";
    
    const visionText = document.querySelector('.vision-section p');
    if (visionText) visionText.textContent = translations.visionText || "";
    
    // Vision points
    const visionPoints = document.querySelectorAll('.vision-points li');
    if (visionPoints && visionPoints.length >= 5) {
        if (translations.visionPoint1) visionPoints[0].textContent = translations.visionPoint1;
        if (translations.visionPoint2) visionPoints[1].textContent = translations.visionPoint2;
        if (translations.visionPoint3) visionPoints[2].textContent = translations.visionPoint3;
        if (translations.visionPoint4) visionPoints[3].textContent = translations.visionPoint4;
        if (translations.visionPoint5) visionPoints[4].textContent = translations.visionPoint5;
    }
    
    // Legal section
    const legalTitle = document.querySelector('.legal-section h2');
    if (legalTitle) legalTitle.textContent = translations.legalTitle || "Legal Authority";
    
    const legalText = document.querySelector('.legal-section p');
    if (legalText) legalText.textContent = translations.legalText || "";
    
    // Join button
    const joinButton = document.querySelector('.join-button');
    if (joinButton) joinButton.textContent = translations.joinButton || "Join the Consortium";
    
    // Equity structure section
    const equityTitle = document.querySelector('.equity-section h2');
    if (equityTitle) equityTitle.textContent = translations.equityTitle || "Equity Structure";
    
    const initialTitle = document.querySelector('.initial-participation h3');
    if (initialTitle) initialTitle.textContent = translations.initialTitle || "Initial Participation";
    
    const initialText = document.querySelector('.initial-participation p');
    if (initialText) initialText.textContent = translations.initialText || "";
    
    // Incentives section
    const incentivesTitle = document.querySelector('.incentives h3');
    if (incentivesTitle) incentivesTitle.textContent = translations.incentivesTitle || "Performance Incentives";
    
    const incentivesList = document.querySelectorAll('.incentives-list li');
    if (incentivesList && incentivesList.length >= 4) {
        if (translations.incentive1) incentivesList[0].textContent = translations.incentive1;
        if (translations.incentive2) incentivesList[1].textContent = translations.incentive2;
        if (translations.incentive3) incentivesList[2].textContent = translations.incentive3;
        if (translations.incentive4) incentivesList[3].textContent = translations.incentive4;
    }
    
    // Vesting section
    const vestingTitle = document.querySelector('.vesting h3');
    if (vestingTitle) vestingTitle.textContent = translations.vestingTitle || "Vesting Period";
    
    const vestingText = document.querySelector('.vesting p');
    if (vestingText) vestingText.textContent = translations.vestingText || "";
    
    // Contact section
    const contactTitle = document.querySelector('.contact-section h2');
    if (contactTitle) contactTitle.textContent = translations.contactTitle || "Join the Consortium";
    
    const contactText = document.querySelector('.contact-section > p');
    if (contactText) contactText.textContent = translations.contactText || "";
    
    const contactInfoTitle = document.querySelector('.contact-info h3');
    if (contactInfoTitle) contactInfoTitle.textContent = translations.contactInfoTitle || "Contact Information";
}

// Function to translate the News page
function translateNewsPage(translations) {
    if (!translations) {
        console.warn('No translations provided for news page');
        return;
    }
    
    // Page title and introduction
    const pageTitle = document.querySelector('.page-header h1, .news-title, h1.title');
    if (pageTitle) pageTitle.textContent = translations.pageTitle || "News & Updates";
    
    const introText = document.querySelector('.news-intro, .intro-text, .news-description');
    if (introText) introText.textContent = translations.introText || "";
    
    // Latest news section
    const latestNewsTitle = document.querySelector('.latest-news-title, .news-section h2:first-of-type');
    if (latestNewsTitle) latestNewsTitle.textContent = translations.latestNewsTitle || "Latest News";
    
    // Upcoming events section
    const upcomingEventsTitle = document.querySelector('.upcoming-events-title, .events-section h2');
    if (upcomingEventsTitle) upcomingEventsTitle.textContent = translations.upcomingEventsTitle || "Upcoming Events";
    
    // Press releases section
    const pressReleasesTitle = document.querySelector('.press-releases-title, .press-section h2');
    if (pressReleasesTitle) pressReleasesTitle.textContent = translations.pressReleasesTitle || "Press Releases";
    
    // Media gallery section
    const mediaGalleryTitle = document.querySelector('.media-gallery-title, .gallery-section h2');
    if (mediaGalleryTitle) mediaGalleryTitle.textContent = translations.mediaGalleryTitle || "Media Gallery";
    
    // Subscribe section
    const subscribeTitle = document.querySelector('.subscribe-title, .subscribe-section h2');
    if (subscribeTitle) subscribeTitle.textContent = translations.subscribeTitle || "Subscribe to Updates";
    
    const subscribeText = document.querySelector('.subscribe-text, .subscribe-section p');
    if (subscribeText) subscribeText.textContent = translations.subscribeText || "";
    
    // Email input placeholder
    const emailInput = document.querySelector('.subscribe-section input[type="email"], input[name="email"]');
    if (emailInput) emailInput.placeholder = translations.emailPlaceholder || "Your email address";
    
    // Subscribe button
    const subscribeButton = document.querySelector('.subscribe-section button, .subscribe-button');
    if (subscribeButton) subscribeButton.textContent = translations.subscribeButton || "Subscribe";
    
    // No news message (if applicable)
    const noNewsText = document.querySelector('.no-news-text, .empty-state');
    if (noNewsText) noNewsText.textContent = translations.noNewsText || "Check back soon for updates!";
    
    // Media contact section
    const mediaContactTitle = document.querySelector('.media-contact-title, .contact-section h3');
    if (mediaContactTitle) mediaContactTitle.textContent = translations.mediaContactTitle || "Media Contact";
    
    const mediaContactText = document.querySelector('.media-contact-text, .contact-section p');
    if (mediaContactText) mediaContactText.textContent = translations.mediaContactText || "";
    
    console.log('News page translation complete');
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
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const cursorInner = document.createElement('div');
    cursorInner.className = 'cursor-inner';
    cursor.appendChild(cursorInner);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
    
    // Agregar efectos de hover en elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, .card, .btn-primary, .btn-secondary');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
    
    // Ocultar el cursor cuando el mouse sale de la ventana
    document.addEventListener('mouseout', (e) => {
        if (e.relatedTarget === null) {
            cursor.style.opacity = '0';
        }
    });
    
    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
    });
    
    // Efecto de click
    document.addEventListener('mousedown', () => {
        cursor.classList.add('cursor-click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-click');
    });
    
    console.info('Custom cursor initialized');
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

// Función para inicializar el monitoreo de rendimiento
function initializePerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        try {
            // Observar métricas de rendimiento
            const perfObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    console.debug('[Performance]', entry.name, entry.startTime.toFixed(0) + 'ms');
                });
            });
            
            // Observar tipos de métricas que nos interesan
            perfObserver.observe({ entryTypes: ['resource', 'paint', 'navigation'] });
            
            console.info('Performance monitoring initialized');
        } catch (e) {
            console.warn('Performance monitoring not supported:', e);
        }
    }
}

// Helper function to get current language
function getCurrentLanguage() {
    return localStorage.getItem('language') || localStorage.getItem('selectedLanguage') || 'en';
}

// Function to immediately apply stored language on page load - 
// this is crucial for pages other than index.html
document.addEventListener('DOMContentLoaded', function() {
    const storedLang = getCurrentLanguage();
    
    // Only initialize language if translations are available
    if (typeof window.translations !== 'undefined' || typeof window.translationsFallback !== 'undefined') {
        console.info(`Applying stored language preference: ${storedLang} on page load`);
        updateLanguage(storedLang);
    } else {
        console.info('Waiting for translations to load before applying language...');
    }
    
    // Listen for history change events (navigation between pages)
    window.addEventListener('popstate', function() {
        console.info('Navigation detected, re-applying language preference');
        const currentLang = getCurrentLanguage();
        setTimeout(() => {
            updateLanguage(currentLang);
        }, 100); // Small delay to ensure the new page content is loaded
    });
});

// Additionally, implement a manual language application when document is ready (safer approach)
function ensureLanguageApplied() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const currentLang = getCurrentLanguage();
        console.info(`Ensuring language ${currentLang} is applied`);
        updateLanguage(currentLang);
    }
}

// Call this 300ms after page load to make sure everything is ready
setTimeout(ensureLanguageApplied, 300);