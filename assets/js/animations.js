function initRevealAnimations() {

    const targets = document.querySelectorAll(
        ".section-heading, .advantage-card, .case, .service, .timeline__item, .cta__content"
    );

    if (!targets.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!("IntersectionObserver" in window)) return;

    targets.forEach(el => el.classList.add("reveal"));

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: .15, rootMargin: "0px 0px -10% 0px" });

    targets.forEach(el => observer.observe(el));

    window.setTimeout(() => {
        targets.forEach(el => el.classList.add("is-visible"));
    }, 2000);
}
