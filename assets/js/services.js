function initServiceRequests() {

    const links = document.querySelectorAll(".service__link[data-request]");
    const form = document.querySelector(".project-form");

    if (!links.length || !form) return;

    const message = form.elements.message;

    if (!message) return;

    const requests = [...links].map(link => link.dataset.request);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    links.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const request = link.dataset.request;
            const current = message.value;
            const sent = form.classList.contains("is-sent");

            // Fill in only an empty field or one we filled ourselves, never the visitor's own text.
            if (!sent && (current.trim() === "" || requests.some(r => current === r))) {
                message.value = request;
                message.classList.remove("is-invalid");
            }

            form.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });

            if (sent) return;

            window.setTimeout(() => {
                message.focus({ preventScroll: true });
                const end = message.value.length;
                message.setSelectionRange(end, end);
            }, smooth ? 700 : 0);
        });
    });
}
