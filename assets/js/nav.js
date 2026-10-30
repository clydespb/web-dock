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
        if (e.key === "Escape" && nav.classList.contains("is-open")) {
            closeNav();
            burger.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768 && nav.classList.contains("is-open")) {
            closeNav();
        }
    });
}
