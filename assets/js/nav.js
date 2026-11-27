function initMobileNav() {

    const burger = document.querySelector(".burger");
    const nav = document.getElementById("mobile-nav");

    if (!burger || !nav) return;

    const links = nav.querySelectorAll("a");

    function openNav() {
        nav.classList.add("is-open");
        burger.classList.add("is-active");
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "Закрыть меню");
        document.body.classList.add("nav-open");
        // Move keyboard focus into the menu so Tab does not wander behind the overlay.
        window.setTimeout(() => links[0]?.focus({ preventScroll: true }), 60);
    }

    function closeNav() {
        nav.classList.remove("is-open");
        burger.classList.remove("is-active");
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Открыть меню");
        document.body.classList.remove("nav-open");
    }

    burger.addEventListener("click", () => {
        const isOpen = nav.classList.contains("is-open");
        isOpen ? closeNav() : openNav();
    });

    links.forEach(link => {
        link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (e) => {
        if (!nav.classList.contains("is-open")) return;

        if (e.key === "Escape") {
            closeNav();
            burger.focus();
            return;
        }

        // Keep Tab inside the open menu: burger (close) + menu links.
        if (e.key === "Tab") {
            const items = [burger, ...links];
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            } else if (!items.includes(document.activeElement)) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768 && nav.classList.contains("is-open")) {
            closeNav();
        }
    });
}
