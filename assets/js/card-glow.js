function initCardGlow() {

    const cards = document.querySelectorAll(".card");

    if (!cards.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    cards.forEach(card => {

        let frame = null;

        card.addEventListener("pointermove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                card.style.setProperty("--mx", `${x.toFixed(0)}px`);
                card.style.setProperty("--my", `${y.toFixed(0)}px`);
            });
        });
    });
}
