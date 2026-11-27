function initProcessProgress() {

    const timeline = document.querySelector(".timeline");

    if (!timeline) return;

    const items = [...timeline.querySelectorAll(".timeline__item")];
    const steps = items.map(item => item.querySelector(".timeline__step"));

    if (!items.length || steps.some(step => !step)) return;

    const vertical = window.matchMedia("(max-width:576px)");

    function setProgress(progress) {
        timeline.style.setProperty("--progress", progress.toFixed(3));

        const box = timeline.getBoundingClientRect();

        steps.forEach((step, i) => {
            const rect = step.getBoundingClientRect();
            const position = vertical.matches
                ? (rect.top + rect.height / 2 - box.top) / box.height
                : (rect.left + rect.width / 2 - box.left) / box.width;
            items[i].classList.toggle("is-reached", progress >= position - .01);
        });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setProgress(1);
        return;
    }

    let ticking = false;

    function update() {
        ticking = false;

        const rect = timeline.getBoundingClientRect();
        const vh = window.innerHeight;

        // Horizontal line fills while the steps cross the lower half of the screen;
        // the vertical one follows reading down the list.
        const progress = vertical.matches
            ? (vh * .6 - rect.top) / rect.height
            : (vh * .85 - rect.top) / (vh * .45);

        setProgress(Math.min(Math.max(progress, 0), 1));
    }

    function requestUpdate() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    update();
}
