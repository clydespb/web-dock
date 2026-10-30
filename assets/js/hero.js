(function initHeroMotion() {

    const bg = document.querySelector(".hero__bg-parallax");
    const hero = document.querySelector(".hero");

    if (!bg || !hero) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let scrollOffset = 0;
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let ticking = false;

    function onScroll() {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        scrollOffset = Math.min(Math.max(rect.top * -0.04, -24), 24);
        requestTick();
    }

    function onPointerMove(e) {
        const rect = hero.getBoundingClientRect();
        pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 7;
        requestTick();
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(render);
            ticking = true;
        }
    }

    function render() {
        currentX += (pointerX - currentX) * 0.06;
        currentY += (pointerY + scrollOffset - currentY) * 0.06;

        bg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

        if (Math.abs(currentX - pointerX) > 0.05 || Math.abs(currentY - (pointerY + scrollOffset)) > 0.05) {
            requestAnimationFrame(render);
        } else {
            ticking = false;
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    hero.addEventListener("mousemove", onPointerMove);
    hero.addEventListener("mouseleave", () => {
        pointerX = 0;
        pointerY = 0;
        requestTick();
    });

    onScroll();

})();
