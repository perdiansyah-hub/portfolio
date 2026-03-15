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
    const comicCover = document.getElementById('comicCover');
    const comicTitle = document.getElementById('comicTitle');
    const comicVideo = document.getElementById('comicVideo');
    const comicModal = document.getElementById('comicModal');
    const closeModal = document.getElementById('closeModal');
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    // Comic open/close
    if (comicCover) {
        comicCover.addEventListener('click', openComic);
        comicCover.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openComic();
            }
        });
    }
    if (comicTitle) {
        comicTitle.addEventListener('click', openComic);
        comicTitle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openComic();
            }
        });
    }
    if (closeModal) {
        closeModal.addEventListener('click', closeComic);
    }

    // Close modal on backdrop click
    window.addEventListener('click', function (event) {
        if (event.target === comicModal) {
            closeComic();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && comicModal && comicModal.classList.contains('show')) {
            closeComic();
        }
    });

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            const isExpanded = mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded);
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars', !isExpanded);
            icon.classList.toggle('fa-times', isExpanded);
        });
    }

    // Close nav on link click (mobile) — close AFTER scroll starts
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768 && mainNav && menuToggle) {
                // Small delay so smooth scroll target is resolved first
                setTimeout(() => {
                    mainNav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }, 50);
            }
        });
    });

    // Video hover on project cover
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

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Set focus to section for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });

    // Scroll-reveal for sections
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

    // Active nav highlight based on current section in view
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => navObserver.observe(section));

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll progress bar
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        window.addEventListener('scroll', function () {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
        });
    }

    // Showcase boxes: keyboard Enter/Space triggers focus expand
    document.querySelectorAll('.showcase-box').forEach((box) => {
        box.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.focus();
            }
        });
    });

    // ---- Modal helpers ----
    let lastFocusedElement = null;

    function openComic() {
        if (!comicModal) return;
        lastFocusedElement = document.activeElement;
        comicModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        loadComicImages();
        // Focus the close button for accessibility
        setTimeout(() => {
            const closeBtn = document.getElementById('closeModal');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    function closeComic() {
        if (!comicModal) return;
        comicModal.classList.remove('show');
        document.body.style.overflow = '';
        // Return focus to where it was before modal opened
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function loadComicImages() {
        document.querySelectorAll('.comic-page').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function () {
                    this.classList.add('loaded');
                });
            }
        });
    }
}

function setupLoadingScreen() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // FIX: performance.navigation is deprecated. Use PerformanceNavigationTiming instead.
    let isReload = false;
    try {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
            isReload = navEntries[0].type === 'reload';
        } else {
            // Fallback for older browsers (deprecated but kept as safety net)
            isReload = performance.navigation && performance.navigation.type === 1;
        }
    } catch (e) {
        isReload = false;
    }

    // Show loader only on initial page visit, not on reload or back-navigation
    const isFirstVisit = document.referrer === '' || !document.referrer.includes(window.location.hostname);

    if (isFirstVisit && !isReload) {
        loader.classList.add('show');

        setTimeout(() => {
            loader.classList.remove('show');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.style.display = 'none';
                }
            }, 500);
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
                    img.addEventListener('load', function () {
                        this.classList.add('loaded');
                    });
                    img.addEventListener('error', function () {
                        // Gracefully handle broken images
                        this.style.opacity = '0.3';
                    });
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

function initDecodeText() {
    const decodeTexts = document.querySelectorAll('.decode-text');

    decodeTexts.forEach((textElement, index) => {
        const letters = textElement.querySelectorAll('.text-animation');

        letters.forEach(letter => {
            letter.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            letter.classList.remove('state-1', 'state-2', 'state-3');
        });

        // Logo name gets a short initial delay so it fires right after page loads
        const isLogoName = textElement.classList.contains('logo-name');
        const delay = isLogoName ? 400 : index * 300;

        setTimeout(() => {
            decodeText(textElement);
        }, delay);
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

            } else {
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

function setupGallery() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    if (!filterBtns.length || !items.length) return;

    let visibleItems = Array.from(items);
    let currentIndex = 0;

    // ---- Filter ----
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            const filter = this.dataset.filter;
            visibleItems = [];

            items.forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                if (match) {
                    item.classList.remove('hidden');
                    item.classList.remove('fade-in');
                    void item.offsetWidth; // reflow trigger
                    item.classList.add('fade-in');
                    visibleItems.push(item);
                } else {
                    item.classList.add('hidden');
                    item.classList.remove('fade-in');
                }
            });
        });
    });

    // ---- Lightbox open ----
    items.forEach((item, i) => {
        item.addEventListener('click', () => openLightbox(item, i));
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(item, i);
            }
        });
    });

    function openLightbox(item, index) {
        if (!lightbox) return;
        const img = item.querySelector('img');
        const tag = item.querySelector('.gallery-item-tag');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = tag ? tag.textContent : '';
        currentIndex = visibleItems.indexOf(item);
        if (currentIndex === -1) currentIndex = 0;
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
        updateNavVisibility();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showImage(index) {
        const item = visibleItems[index];
        if (!item) return;
        const img = item.querySelector('img');
        const tag = item.querySelector('.gallery-item-tag');
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = tag ? tag.textContent : '';
            lightboxImg.style.opacity = '1';
        }, 150);
        currentIndex = index;
        updateNavVisibility();
    }

    function updateNavVisibility() {
        if (!lightboxPrev || !lightboxNext) return;
        lightboxPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
        lightboxNext.style.opacity = currentIndex === visibleItems.length - 1 ? '0.3' : '1';
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

    if (lightboxPrev) lightboxPrev.addEventListener('click', () => {
        if (currentIndex > 0) showImage(currentIndex - 1);
    });

    if (lightboxNext) lightboxNext.addEventListener('click', () => {
        if (currentIndex < visibleItems.length - 1) showImage(currentIndex + 1);
    });

    // Close on backdrop click
    if (lightbox) lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (!lightbox || !lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && currentIndex > 0) showImage(currentIndex - 1);
        if (e.key === 'ArrowRight' && currentIndex < visibleItems.length - 1) showImage(currentIndex + 1);
    });

    // Smooth img transition
    if (lightboxImg) {
        lightboxImg.style.transition = 'opacity 0.15s ease';
    }
}

function setupDarkMode() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle) return;

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    toggle.addEventListener('click', function () {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        icon.classList.toggle('fa-moon', !isDark);
        icon.classList.toggle('fa-sun', isDark);
    });
}

function setupCustomCursor() {
    const cursor = document.getElementById('cursor');
    const dot = document.getElementById('cursorDot');
    if (!cursor || !dot) return;

    // Only on non-touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    // Smooth cursor follow
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverTargets = 'a, button, [role="button"], [tabindex="0"], .showcase-box, .project-cover-container';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        dot.style.opacity = '1';
    });
}

function setupHeroScroll() {
    const heroScrollHint = document.querySelector('.hero-scroll-hint');
    if (!heroScrollHint) return;
    heroScrollHint.addEventListener('click', function () {
        const about = document.getElementById('about');
        if (about) about.scrollIntoView({ behavior: 'smooth' });
    });
    heroScrollHint.style.cursor = 'pointer';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Handle bfcache (back-forward cache) — hide loader when page restored from cache
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
        // Re-initialize nav state
        const mainNav = document.getElementById('mainNav');
        const menuToggle = document.getElementById('menuToggle');
        if (mainNav && menuToggle) {
            mainNav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }
    }
});
