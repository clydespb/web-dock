function initHeader() {

    const header = document.querySelector(".header");

    if (!header) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {

            header.classList.add("header--scroll");

        } else {

            header.classList.remove("header--scroll");

        }

    });

}
