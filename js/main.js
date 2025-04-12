// Función para manejar el menú responsive
document.addEventListener('DOMContentLoaded', () => {
    // Aquí puedes agregar funcionalidad JavaScript según sea necesario
    console.log('Sitio web cargado correctamente');
});

document.addEventListener('DOMContentLoaded', function() {
    // Buscar todos los elementos con la clase 'expandable-title'
    const expandableTitles = document.querySelectorAll('.expandable-title');
    
    // Agregar evento de clic a cada título expandible
    expandableTitles.forEach(title => {
        title.addEventListener('click', function() {
            // Alternar la clase 'active' en el título
            this.classList.toggle('active');
            
            // Obtener el contenido asociado con este título
            const content = this.nextElementSibling;
            
            // Alternar la visibilidad del contenido
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Inicializar el idioma en español por defecto
    let currentLanguage = 'es';

    // Función para cambiar el idioma
    function changeLanguage(lang) {
        currentLanguage = lang;
        
        // Obtener todos los elementos con atributos de traducción
        const elements = document.querySelectorAll('[data-lang-es], [data-lang-en]');
        
        // Cambiar el texto de cada elemento según el idioma seleccionado
        elements.forEach(el => {
            if (lang === 'es' && el.hasAttribute('data-lang-es')) {
                el.textContent = el.getAttribute('data-lang-es');
            } else if (lang === 'en' && el.hasAttribute('data-lang-en')) {
                el.textContent = el.getAttribute('data-lang-en');
            }
        });
    }

    // Agregar eventos a los botones de idioma
    const langButtons = document.querySelectorAll('.language-switcher button');
    if (langButtons) {
        langButtons.forEach(button => {
            button.addEventListener('click', function() {
                changeLanguage(this.getAttribute('data-lang'));
                
                // Marcar el botón actual como activo
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
        if (this.video) {
            this.initializeVideo();
        }
    }

    initializeVideo() {
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
            } else {
                this.video.play().catch(() => {});
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
    new ScrollController();
    new LanguageController();
    new VideoController();
});