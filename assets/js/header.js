function initHeader() {

    const header = document.querySelector(".header");

    if (!header) return;

    const lightSections = document.querySelectorAll(".cases");

    let ticking = false;

    function update() {

        ticking = false;

        header.classList.toggle("header--scroll", window.scrollY > 40);

        const edge = header.offsetHeight;
        let onLight = false;

        lightSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < edge && rect.bottom > 0) onLight = true;
        });

        header.classList.toggle("header--on-light", onLight);
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
