function initCookieBanner() {

    const banner = document.querySelector(".cookie");

    if (!banner) return;

    const button = banner.querySelector(".cookie__button");

    if (!button) return;

    const KEY = "wd-cookie-consent";

    function isAccepted() {
        try {
            return window.localStorage.getItem(KEY) === "1";
        } catch (e) {
            return false;
        }
    }

    if (isAccepted()) return;

    function setHeight() {
        document.body.style.setProperty("--cookie-height", `${banner.offsetHeight}px`);
    }

    banner.hidden = false;
    document.body.classList.add("cookie-open");
    setHeight();

    requestAnimationFrame(() => {
        requestAnimationFrame(() => banner.classList.add("is-visible"));
    });

    window.addEventListener("resize", setHeight);

    button.addEventListener("click", () => {

        try {
            window.localStorage.setItem(KEY, "1");
        } catch (e) {}

        window.removeEventListener("resize", setHeight);
        banner.classList.remove("is-visible");
        document.body.classList.remove("cookie-open");
        document.body.style.removeProperty("--cookie-height");

        window.setTimeout(() => {
            banner.hidden = true;
        }, 500);
    });
}
