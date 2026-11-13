function initCaseSlides() {

    const medias = document.querySelectorAll(".case__media");

    if (!medias.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const INTERVAL = 1700;

    medias.forEach(media => {

        const screen = media.querySelector(".case__screen[data-slides]");

        if (!screen) return;

        const sources = screen.dataset.slides.split(",").map(s => s.trim()).filter(Boolean);

        if (!sources.length) return;

        let extras = null;
        let dots = null;
        let index = 0;
        let timer = null;

        function build() {

            extras = sources.map(src => {
                const img = document.createElement("img");
                img.className = "case__shot case__shot--extra";
                img.alt = "";
                img.decoding = "async";
                img.setAttribute("aria-hidden", "true");
                img.addEventListener("error", () => img.remove());
                img.src = src;
                screen.appendChild(img);
                return img;
            });

            const wrap = document.createElement("div");
            wrap.className = "case__dots";
            wrap.setAttribute("aria-hidden", "true");

            dots = [];

            for (let i = 0; i <= sources.length; i++) {
                const dot = document.createElement("span");
                wrap.appendChild(dot);
                dots.push(dot);
            }

            screen.appendChild(wrap);
        }

        function show(next) {
            index = next;
            extras.forEach((img, i) => img.classList.toggle("is-active", i === index - 1));
            dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
        }

        function ready(i) {
            if (i === 0) return true;
            const img = extras[i - 1];
            return img.isConnected && img.complete && img.naturalWidth > 0;
        }

        function tick() {
            const next = (index + 1) % (sources.length + 1);
            if (ready(next)) show(next);
        }

        function start() {
            if (timer) return;
            if (!extras) build();
            show(0);
            media.classList.add("is-cycling");
            timer = window.setInterval(tick, INTERVAL);
        }

        function stop() {
            if (!timer) return;
            window.clearInterval(timer);
            timer = null;
            media.classList.remove("is-cycling");
            show(0);
        }

        media.addEventListener("mouseenter", start);
        media.addEventListener("mouseleave", stop);
        media.addEventListener("focus", start);
        media.addEventListener("blur", stop);
    });
}
