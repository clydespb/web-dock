function initMagneticButtons() {

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const SPRING = "transform .6s cubic-bezier(.34,1.56,.64,1)";

    document.querySelectorAll(".button").forEach(button => {

        let frame = null;

        button.addEventListener("mouseenter", () => {
            button.style.transition = "";
        });

        button.addEventListener("mousemove", e => {
            const rect = button.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * .18;
            const y = (e.clientY - rect.top - rect.height / 2) * .18;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                button.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
            });
        });

        button.addEventListener("mouseleave", () => {
            cancelAnimationFrame(frame);
            button.style.transition = SPRING;
            button.style.transform = "";
        });

    });

}
