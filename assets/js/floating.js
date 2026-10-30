function initFloatingTelegram() {

    const btn = document.querySelector(".tg-float");
    const hero = document.querySelector(".hero");
    const footer = document.querySelector(".footer");

    if (!btn || !hero || !("IntersectionObserver" in window)) return;

    let heroVisible = true;
    let footerVisible = false;

    function update() {
        btn.classList.toggle("is-visible", !heroVisible && !footerVisible);
    }

    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }, { threshold: .15 }).observe(hero);

    if (footer) {
        new IntersectionObserver(([e]) => { footerVisible = e.isIntersecting; update(); }, { threshold: 0 }).observe(footer);
    }
}
