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