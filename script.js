document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupLoadingScreen();
    setupLazyLoading();
    initDecodeText();
});

function initializePage() {
    const comicCover = document.getElementById('comicCover');
    const comicTitle = document.getElementById('comicTitle');
    const comicVideo = document.getElementById('comicVideo');
    const comicModal = document.getElementById('comicModal');
    const closeModal = document.getElementById('closeModal');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (comicCover) comicCover.addEventListener('click', openComic);
    if (comicTitle) comicTitle.addEventListener('click', openComic);
    if (closeModal) closeModal.addEventListener('click', closeComic);
    
    window.addEventListener('click', function(event) {
        if (event.target === comicModal) {
            closeComic();
        }
    });
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }
    
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });
    
    if (comicCover && comicVideo) {
        comicCover.addEventListener('mouseenter', function() {
            comicVideo.load();
            comicVideo.currentTime = 0;
            comicVideo.play().catch(() => {});
        });
        
        comicCover.addEventListener('mouseleave', function() {
            comicVideo.pause();
            comicVideo.currentTime = 0;
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    function openComic() {
        if (comicModal) {
            comicModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            loadComicImages();
        }
    }
    
    function closeComic() {
        if (comicModal) {
            comicModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
    
    function loadComicImages() {
        document.querySelectorAll('.comic-page').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    this.classList.add('loaded');
                });
            }
        });
    }
}

function setupLoadingScreen() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    
    if (document.referrer === '' || performance.navigation.type === 1) {
        loader.classList.add('show');
        
        setTimeout(() => {
            loader.classList.remove('show');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.style.display = 'none';
                }
            }, 500);
        }, 1000);
    } else {
        loader.style.display = 'none';
    }
}

function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    img.addEventListener('load', function() {
                        this.classList.add('loaded');
                    });
                    
                    if (img.complete) {
                        img.classList.add('loaded');
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, { 
            rootMargin: '50px 0px',
            threshold: 0.01 
        });
        
        document.querySelectorAll('.comic-page').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

/* ===== DECODE TEXT EFFECT - SMOOTH VERSION ===== */
function initDecodeText() {
    const decodeTexts = document.querySelectorAll('.decode-text');
    
    decodeTexts.forEach((textElement, index) => {
        const letters = textElement.querySelectorAll('.text-animation');
        
        letters.forEach(letter => {
            letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            letter.classList.remove('state-1', 'state-2', 'state-3');
        });
        
        setTimeout(() => {
            decodeText(textElement);
        }, index * 300);
    });
}

function decodeText(textElement) {
    const letters = textElement.querySelectorAll('.text-animation');
    if (letters.length === 0) return;
    
    for (let i = 0; i < letters.length; i++) {
        letters[i].style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        letters[i].classList.remove('state-1', 'state-2', 'state-3');
    }
    
    const states = [];
    for (let i = 0; i < letters.length; i++) {
        const random = Math.random();
        if (random < 0.2) {
            states[i] = 1;
        } else if (random < 0.4) {
            states[i] = 2;
        } else {
            states[i] = 3;
        }
    }
    
    shuffleArray(states);
    
    for (let i = 0; i < letters.length; i++) {
        const delay = i * 80;
        
        setTimeout((letter, state) => {
            if (state === 1) {
                letter.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.classList.add('state-1');
                
                setTimeout(() => {
                    letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    letter.classList.remove('state-1');
                    letter.classList.add('state-2');
                    
                    setTimeout(() => {
                        letter.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        letter.classList.remove('state-2');
                        letter.classList.add('state-3');
                    }, 400);
                    
                }, 300);
                
            } else if (state === 2) {
                letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.classList.add('state-2');
                
                setTimeout(() => {
                    letter.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    letter.classList.remove('state-2');
                    letter.classList.add('state-3');
                }, 450);
                
            } else if (state === 3) {
                letter.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.classList.add('state-3');
            }
        }, delay, letters[i], states[i]);
    }
    
    const maxDelay = letters.length * 80 + 1000;
    setTimeout(() => {
        for (let i = 0; i < letters.length; i++) {
            letters[i].style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            letters[i].classList.remove('state-1', 'state-2');
            letters[i].classList.add('state-3');
        }
    }, maxDelay);
    
    const nextDelay = 6000 + Math.random() * 4000;
    setTimeout(() => {
        decodeText(textElement);
    }, nextDelay);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
});