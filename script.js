document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    setupLoadingScreen();
    setupLazyLoading();
    initDecodeText();
    setupDarkMode();
    setupCustomCursor();
    setupHeroScroll();
    setupGallery();
});

function initializePage() {
    const comicCover  = document.getElementById('comicCover');
    const comicTitle  = document.getElementById('comicTitle');
    const comicVideo  = document.getElementById('comicVideo');
    const comicModal  = document.getElementById('comicModal');
    const closeModal  = document.getElementById('closeModal');
    const menuToggle  = document.getElementById('menuToggle');
    const mainNav     = document.getElementById('mainNav');

    if (comicCover) {
        comicCover.addEventListener('click', openComic);
        comicCover.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openComic(); }
        });
    }
    if (comicTitle) {
        comicTitle.addEventListener('click', openComic);
        comicTitle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openComic(); }
        });
    }
    if (closeModal) closeModal.addEventListener('click', closeComic);

    window.addEventListener('click', function (e) {
        if (e.target === comicModal) closeComic();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && comicModal && comicModal.classList.contains('show')) closeComic();
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded);
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars',  !isExpanded);
            icon.classList.toggle('fa-times',  isExpanded);
        });
    }

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768 && mainNav && menuToggle) {
                setTimeout(() => {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    const icon = menuToggle.querySelector('i');
                    if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
                }, 50);
            }
        });
    });

    if (comicCover && comicVideo) {
        comicCover.addEventListener('mouseenter', function () {
            comicVideo.load();
            comicVideo.currentTime = 0;
            comicVideo.play().catch(() => {});
        });
        comicCover.addEventListener('mouseleave', function () {
            comicVideo.pause();
            comicVideo.currentTime = 0;
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('section').forEach(s => revealObserver.observe(s));

    // FIX #4: threshold 0.2 → 0.05, tambah rootMargin agar nav highlight tepat di mobile
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) link.classList.add('active');
                });
            }
        });
    }, { threshold: 0.05, rootMargin: '-10% 0px -60% 0px' });  // FIX #4
    sections.forEach(s => navObserver.observe(s));

    const backToTop  = document.getElementById('backToTop');
    const progressBar = document.getElementById('scrollProgress');
    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    if (backToTop || progressBar) {
        window.addEventListener('scroll', function () {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (backToTop)    backToTop.classList.toggle('visible', scrollTop > 400);
            if (progressBar)  progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
        }, { passive: true });
    }

    // FIX #3: Ganti touchend + preventDefault (yang block scroll) dengan pointerup
    document.querySelectorAll('.showcase-box').forEach((box) => {
        box.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.focus(); }
        });
        box.addEventListener('pointerup', function (e) {  // FIX #3
            if (e.pointerType === 'touch' && document.activeElement !== this) this.focus();
        });
    });
    document.addEventListener('pointerdown', function (e) {
        if (!e.target.closest('.showcase-box')) {
            const focused = document.querySelector('.showcase-box:focus');
            if (focused) focused.blur();
        }
    }, { passive: true });

    let lastFocusedElement = null;
    let comicImagesLoaded  = false;  // FIX #2

    function openComic() {
        if (!comicModal) return;
        lastFocusedElement = document.activeElement;
        comicModal.classList.add('show');
        // Kompensasi lebar scrollbar agar header tidak shift
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
        }
        // FIX #2: load images hanya sekali
        if (!comicImagesLoaded) {
            loadComicImages();
            comicImagesLoaded = true;
        }
        setTimeout(() => {
            const closeBtn = document.getElementById('closeModal');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    function closeComic() {
        if (!comicModal) return;
        comicModal.classList.remove('show');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        // FIX #1: pause video saat modal ditutup
        if (comicVideo) {
            comicVideo.pause();
            comicVideo.currentTime = 0;
        }
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function loadComicImages() {
        document.querySelectorAll('.comic-page').forEach(img => {
            if (img.classList.contains('loaded')) return;  // FIX #2
            img.classList.add('skeleton');
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.remove('skeleton');
                img.classList.add('loaded');
            } else {
                img.addEventListener('load',  function () { this.classList.remove('skeleton'); this.classList.add('loaded'); }, { once: true });
                img.addEventListener('error', function () { this.classList.remove('skeleton'); this.style.opacity = '0.2'; }, { once: true });
            }
        });
    }
}

function setupLoadingScreen() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    // FIX #6: Ganti referrer check yang tidak reliable dengan sessionStorage
    const hasVisited = sessionStorage.getItem('portfolio_visited');
    if (!hasVisited) {
        sessionStorage.setItem('portfolio_visited', '1');
        loader.classList.add('show');
        setTimeout(() => {
            loader.classList.remove('show');
            setTimeout(() => { if (loader.parentNode) loader.style.display = 'none'; }, 500);
        }, 2000);
    } else {
        loader.style.display = 'none';
    }
}

function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.complete) {
                    img.classList.add('loaded');
                } else {
                    img.addEventListener('load',  function () { this.classList.add('loaded'); });
                    img.addEventListener('error', function () { this.style.opacity = '0.3'; });
                }
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '50px 0px', threshold: 0.01 });
    document.querySelectorAll('.comic-page').forEach(img => imageObserver.observe(img));
}

function initDecodeText() {
    document.querySelectorAll('.decode-text').forEach((textElement, index) => {
        textElement.querySelectorAll('.text-animation').forEach(letter => {
            letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            letter.classList.remove('state-1', 'state-2', 'state-3');
        });
        const delay = textElement.classList.contains('logo-name') ? 400 : index * 300;
        setTimeout(() => decodeText(textElement), delay);
    });
}

function decodeText(textElement) {
    if (!textElement.isConnected) return;  // FIX #5: guard jika elemen sudah di-remove

    const letters = textElement.querySelectorAll('.text-animation');
    if (letters.length === 0) return;

    for (let i = 0; i < letters.length; i++) {
        letters[i].style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        letters[i].classList.remove('state-1', 'state-2', 'state-3');
    }

    const states = Array.from({ length: letters.length }, () => {
        const r = Math.random();
        return r < 0.2 ? 1 : r < 0.4 ? 2 : 3;
    });
    shuffleArray(states);

    for (let i = 0; i < letters.length; i++) {
        setTimeout((letter, state) => {
            if (!letter.isConnected) return;  // FIX #5
            if (state === 1) {
                letter.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.classList.add('state-1');
                setTimeout(() => {
                    if (!letter.isConnected) return;
                    letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    letter.classList.remove('state-1'); letter.classList.add('state-2');
                    setTimeout(() => {
                        if (!letter.isConnected) return;
                        letter.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        letter.classList.remove('state-2'); letter.classList.add('state-3');
                    }, 400);
                }, 300);
            } else if (state === 2) {
                letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.classList.add('state-2');
                setTimeout(() => {
                    if (!letter.isConnected) return;
                    letter.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    letter.classList.remove('state-2'); letter.classList.add('state-3');
                }, 450);
            } else {
                letter.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                letter.classList.add('state-3');
            }
        }, i * 80, letters[i], states[i]);
    }

    const maxDelay = letters.length * 80 + 1000;
    setTimeout(() => {
        if (!textElement.isConnected) return;
        letters.forEach(l => { l.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'; l.classList.remove('state-1', 'state-2'); l.classList.add('state-3'); });
    }, maxDelay);

    setTimeout(() => decodeText(textElement), 6000 + Math.random() * 4000);
}

function setupGallery() {
    const filterBtns      = document.querySelectorAll('.gallery-filter-btn');
    const items           = document.querySelectorAll('.gallery-item');
    const lightbox        = document.getElementById('lightbox');
    const lightboxImg     = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose   = document.getElementById('lightboxClose');
    const lightboxPrev    = document.getElementById('lightboxPrev');
    const lightboxNext    = document.getElementById('lightboxNext');

    let visibleItems = Array.from(items);
    let currentIndex = 0;

    // FIX #7 & #8: Guard filter terpisah dari guard lightbox
    if (filterBtns.length && items.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
                this.classList.add('active'); this.setAttribute('aria-selected', 'true');
                const filter = this.dataset.filter;
                visibleItems = [];
                items.forEach(item => {
                    const match = filter === 'all' || item.dataset.category === filter;
                    if (match) {
                        item.classList.remove('hidden', 'fade-in');
                        void item.offsetWidth;
                        item.classList.add('fade-in');
                        visibleItems.push(item);
                    } else {
                        item.classList.add('hidden'); item.classList.remove('fade-in');
                    }
                });
            });
        });

        items.forEach((item, i) => {
            item.addEventListener('click', () => openLightbox(item, i));
            item.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item, i); }
            });
        });
    }

    // FIX #7: Lightbox setup jalan independen dari gallery filter
    if (!lightbox) return;

    function openLightbox(item, index) {
        const img = item.querySelector('img');
        const tag = item.querySelector('.gallery-item-tag');
        if (!img) return;
        lightboxImg.src = img.src; lightboxImg.alt = img.alt;
        lightboxCaption.textContent = tag ? tag.textContent : '';
        currentIndex = visibleItems.indexOf(item);
        if (currentIndex === -1) currentIndex = 0;
        lightbox.classList.add('show');
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = scrollbarWidth + 'px';
        }
        if (lightboxClose) lightboxClose.focus();
        updateNavVisibility();
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    function showImage(index) {
        const item = visibleItems[index];
        if (!item) return;
        const img = item.querySelector('img');
        const tag = item.querySelector('.gallery-item-tag');
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = img.src; lightboxImg.alt = img.alt;
            lightboxCaption.textContent = tag ? tag.textContent : '';
            lightboxImg.style.opacity = '1';
        }, 150);
        currentIndex = index;
        updateNavVisibility();
    }

    function updateNavVisibility() {
        if (lightboxPrev) lightboxPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
        if (lightboxNext) lightboxNext.style.opacity = currentIndex === visibleItems.length - 1 ? '0.3' : '1';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev)  lightboxPrev.addEventListener('click',  () => { if (currentIndex > 0) showImage(currentIndex - 1); });
    if (lightboxNext)  lightboxNext.addEventListener('click',  () => { if (currentIndex < visibleItems.length - 1) showImage(currentIndex + 1); });
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft'  && currentIndex > 0)                       showImage(currentIndex - 1);
        if (e.key === 'ArrowRight' && currentIndex < visibleItems.length - 1) showImage(currentIndex + 1);
    });
    if (lightboxImg) lightboxImg.style.transition = 'opacity 0.15s ease';
}

function setupDarkMode() {
    const toggle = document.getElementById('themeToggle');
    const icon   = document.getElementById('themeIcon');
    if (!toggle) return;
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
    toggle.addEventListener('click', function () {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (icon) { icon.classList.toggle('fa-moon', !isDark); icon.classList.toggle('fa-sun', isDark); }
    });
}

function setupCustomCursor() {
    const cursor = document.getElementById('cursor');
    const dot    = document.getElementById('cursorDot');
    if (!cursor || !dot) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    const hoverTargets = 'a, button, [role="button"], [tabindex="0"], .showcase-box, .project-cover-container';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; dot.style.opacity = '1'; });
}

function setupHeroScroll() {
    const hint = document.querySelector('.hero-scroll-hint');
    if (!hint) return;
    hint.style.cursor = 'pointer';
    hint.addEventListener('click', () => {
        const about = document.getElementById('about');
        if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
        const mainNav = document.getElementById('mainNav');
        const menuToggle = document.getElementById('menuToggle');
        if (mainNav && menuToggle) {
            mainNav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('i');
            if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-times'); }
        }
    }
});