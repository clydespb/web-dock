function initNavSpy() {

    const links = [...document.querySelectorAll('.nav a[href^="#"], .mobile-nav__list a[href^="#"]')];

    if (!links.length) return;

    const ids = [...new Set(links.map(link => link.getAttribute("href").slice(1)))];
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);

    if (!sections.length) return;

    let current = null;
    let ticking = false;

    function setActive(id) {
        if (id === current) return;
        current = id;
        links.forEach(link => {
            const active = link.getAttribute("href") === "#" + id;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
        });
    }

    function update() {
        ticking = false;

        const line = window.innerHeight * .35;
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        let active = null;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= line && rect.bottom > line) active = section.id;
        });

        // The footer is short and may never reach the line: count the page end as "Контакты".
        if (atBottom) active = sections[sections.length - 1].id;

        setActive(active);
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
