function initFloatingTelegram() {

    const btn = document.querySelector(".tg-float");
    const hero = document.querySelector(".hero");
    const footer = document.querySelector(".footer");
    const form = document.querySelector(".project-form");
    const cases = document.querySelector(".cases");

    if (!btn || !hero || !("IntersectionObserver" in window)) return;

    let heroVisible = true;
    let footerVisible = false;
    let formVisible = false;
    let casesVisible = false;

    function update() {
        btn.classList.toggle("is-visible", !heroVisible && !footerVisible && !formVisible && !casesVisible);
    }

    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }, { threshold: .15 }).observe(hero);

    if (footer) {
        new IntersectionObserver(([e]) => { footerVisible = e.isIntersecting; update(); }, { threshold: 0 }).observe(footer);
    }

    if (form) {
        new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; update(); }, { threshold: 0 }).observe(form);
    }

    // On case cards and service rows the button covers links and the "Обсудить" arrows.
    const covered = [cases, document.querySelector(".services")].filter(Boolean);
    const coveredNow = new Set();

    if (covered.length) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => e.isIntersecting ? coveredNow.add(e.target) : coveredNow.delete(e.target));
            casesVisible = coveredNow.size > 0;
            update();
        }, { threshold: 0, rootMargin: "-20% 0px -20% 0px" });
        covered.forEach(el => observer.observe(el));
    }
}
