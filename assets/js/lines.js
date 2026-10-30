function initLineReveal() {

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const headings = Array.from(document.querySelectorAll(".section-heading h2, .cta h2"));
    if (!headings.length) return;

    const originals = new Map(headings.map(h => [h, h.innerHTML]));
    const done = new Set();

    function split(el) {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = "";

        const spans = words.map((w, i) => {
            const s = document.createElement("span");
            s.textContent = w;
            el.appendChild(s);
            if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
            return s;
        });

        const lines = [];
        let top = null;
        spans.forEach(s => {
            if (top === null || Math.abs(s.offsetTop - top) > 2) {
                lines.push([]);
                top = s.offsetTop;
            }
            lines[lines.length - 1].push(s.textContent);
        });

        el.textContent = "";
        lines.forEach((words, i) => {
            const line = document.createElement("span");
            line.className = "lr-line";
            const inner = document.createElement("span");
            inner.className = "lr-inner";
            inner.style.transitionDelay = (i * 0.09) + "s";
            inner.textContent = words.join(" ");
            line.appendChild(inner);
            el.appendChild(line);
        });

        el.classList.add("lr-ready");
    }

    function restore(el) {
        if (done.has(el)) return;
        done.add(el);
        el.innerHTML = originals.get(el);
        el.classList.remove("lr-ready", "lr-in");
    }

    function reveal(el) {
        if (el.classList.contains("lr-in")) return;
        el.classList.add("lr-in");
        const inners = el.querySelectorAll(".lr-inner");
        const last = inners[inners.length - 1];
        if (last) last.addEventListener("transitionend", () => restore(el), { once: true });
        setTimeout(() => restore(el), 2500);
    }

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                reveal(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: .2 });

    const ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    ready.then(() => {
        headings.forEach(h => { split(h); observer.observe(h); });

        let t;
        window.addEventListener("resize", () => {
            clearTimeout(t);
            t = setTimeout(() => {
                headings.forEach(h => {
                    if (done.has(h) || h.classList.contains("lr-in")) return;
                    h.innerHTML = originals.get(h);
                    split(h);
                });
            }, 150);
        });

        setTimeout(() => headings.forEach(h => { if (!done.has(h)) reveal(h); }), 4000);
    });
}
