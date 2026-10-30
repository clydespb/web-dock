function initSpotlight() {

    const spot = document.querySelector(".cursor-spotlight");

    if (!spot) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const zoneSelector = ".advantages, .services, .process, .cta";

    function setPosition(x, y) {
        spot.style.setProperty("--spot-x", `${x}px`);
        spot.style.setProperty("--spot-y", `${y}px`);
    }

    function setActive(target) {
        const inZone = target && target.closest && target.closest(zoneSelector);
        spot.classList.toggle("is-active", !!inZone);
    }

    window.addEventListener("mousemove", e => {
        setPosition(e.clientX, e.clientY);
        setActive(e.target);
    }, { passive: true });

    window.addEventListener("mouseout", e => {
        if (!e.relatedTarget) spot.classList.remove("is-active");
    });

    window.addEventListener("touchmove", e => {
        const t = e.touches[0];
        if (!t) return;
        setPosition(t.clientX, t.clientY);
        setActive(document.elementFromPoint(t.clientX, t.clientY));
    }, { passive: true });

    window.addEventListener("touchend", () => {
        spot.classList.remove("is-active");
    });

}
