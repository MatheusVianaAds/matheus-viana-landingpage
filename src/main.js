document.querySelectorAll('details[name]').forEach((details) => {
    details.addEventListener('toggle', (e) => {
        const name = details.getAttribute('name');

        if (e.newState === 'open') {
            document.querySelectorAll(`details[name="${name}"][open]`).forEach((openDetails) => {
                if (openDetails !== details) {
                    openDetails.removeAttribute('open');
                }
            });
        }
    });
});

const carousels = document.querySelectorAll('[data-carousel]');

carousels.forEach((carousel) => {
    const items = Array.from(carousel.querySelectorAll('[data-carousel-item]'));
    if (!items.length) return;

    let index = 0;
    let timer = null;
    let visible = false;
    let paused = false;

    const interval = Number(carousel.dataset.carouselInterval || 4000);

    const getStep = () => items[0].getBoundingClientRect().width + parseFloat(getComputedStyle(carousel).gap || 0);

    const scrollToIndex = (nextIndex) => {
        index = nextIndex % items.length;
        carousel.scrollTo({
            left: items[index].offsetLeft,
            behavior: 'smooth',
        });
    };

    const start = () => {
        if (timer || !visible) return;
        timer = setInterval(() => {
            if (paused) return;
            scrollToIndex((index + 1) % items.length);
        }, interval);
    };

    const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
        });
    }, { threshold: 0.35 });

    observer.observe(carousel);

    carousel.addEventListener('mouseenter', () => paused = true);
    carousel.addEventListener('mouseleave', () => paused = false);
    carousel.addEventListener('touchstart', () => paused = true, { passive: true });
    carousel.addEventListener('touchend', () => {
        setTimeout(() => paused = false, interval);
    }, { passive: true });

    carousel.addEventListener('scroll', () => {
        const current = items.findIndex((item) => {
            const rect = item.getBoundingClientRect();
            const crect = carousel.getBoundingClientRect();
            return rect.left >= crect.left - 1 && rect.right <= crect.right + 1;
        });
        if (current >= 0) index = current;
    }, { passive: true });
});
