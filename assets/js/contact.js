function initContactForm() {

    const form = document.querySelector(".project-form");

    if (!form) return;

    const contact = form.elements.contact;
    const message = form.elements.message;
    const label = form.querySelector("#contact-label");
    const alertBox = form.querySelector(".project-form__alert");
    const submit = form.querySelector(".project-form__submit");
    const submitText = form.querySelector(".project-form__submit-text");
    const body = form.querySelector(".project-form__body");
    const success = form.querySelector(".project-form__success");
    const successText = form.querySelector(".project-form__success-text");
    const again = form.querySelector(".project-form__again");

    if (!contact || !message || !alertBox || !submit || !body || !success) return;

    // SmartCaptcha (~70 KB) is loaded only when the form gets close to the screen.
    let captchaRequested = false;

    function loadCaptcha() {
        if (captchaRequested) return;
        captchaRequested = true;
        const script = document.createElement("script");
        script.src = "https://smartcaptcha.yandexcloud.net/captcha.js";
        script.defer = true;
        document.head.appendChild(script);
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                loadCaptcha();
            }
        }, { rootMargin: "800px 0px" });
        observer.observe(form);
    } else {
        loadCaptcha();
    }

    form.addEventListener("focusin", loadCaptcha);

    const SUBMIT_TEXT = submitText.textContent;

    const ERRORS = {
        invalid: "Проверьте, что контакт и описание задачи заполнены верно.",
        captcha_failed: "Проверка «Я не робот» не прошла. Пройдите её ещё раз и отправьте заявку.",
        captcha_host: "Проверка «Я не робот» не прошла. Пройдите её ещё раз и отправьте заявку.",
        rate_limit: "Слишком много попыток подряд. Попробуйте через 10 минут или напишите нам напрямую.",
        network: "Нет соединения с сервером. Проверьте интернет и попробуйте ещё раз.",
        default: "Не удалось отправить заявку. Попробуйте позже или напишите нам на почту или в Telegram."
    };

    function channel() {
        return form.elements.channel.value === "telegram" ? "telegram" : "email";
    }

    function updateContact() {
        const email = channel() === "email";
        label.textContent = email ? "Ваш email" : "Ваше имя пользователя в Telegram";
        contact.type = email ? "email" : "text";
        contact.autocomplete = email ? "email" : "off";
        contact.placeholder = email ? "name@example.ru" : "@username";
        contact.pattern = email ? ".+@.+\\..+" : "@?[A-Za-z0-9_]{1,32}";
        contact.classList.remove("is-invalid");
    }

    function showAlert(text) {
        alertBox.textContent = text;
        alertBox.hidden = false;
        const rect = alertBox.getBoundingClientRect();
        if (rect.top < 90 || rect.bottom > window.innerHeight) {
            alertBox.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }

    function hideAlert() {
        alertBox.hidden = true;
        alertBox.textContent = "";
    }

    function setSending(sending) {
        form.classList.toggle("is-sending", sending);
        form.setAttribute("aria-busy", sending ? "true" : "false");
        submit.disabled = sending;
        submitText.textContent = sending ? "Отправляем…" : SUBMIT_TEXT;
    }

    function validate() {
        const invalid = [contact, message].filter(field => {
            field.value = field.value.trim();
            const bad = !field.checkValidity();
            field.classList.toggle("is-invalid", bad);
            field.setAttribute("aria-invalid", bad ? "true" : "false");
            return bad;
        });

        if (!invalid.length) return true;

        if (invalid[0] === contact) {
            showAlert(channel() === "email"
                ? "Укажите email, на который вам ответить, например name@example.ru."
                : "Укажите имя пользователя в Telegram, например @username.");
        } else {
            showAlert("Опишите в паре слов, что хотите сделать.");
        }

        invalid[0].focus();
        return false;
    }

    function showSuccess(sentChannel) {
        successText.textContent = sentChannel === "email"
            ? "Спасибо. Ответим на указанную почту."
            : "Спасибо. Напишем вам в Telegram.";
        form.classList.add("is-sent");
        body.inert = true;
        body.setAttribute("aria-hidden", "true");
        success.hidden = false;
        success.focus({ preventScroll: true });
        form.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    function resetForm() {
        form.reset();
        updateContact();
        hideAlert();
        success.hidden = true;
        form.classList.remove("is-sent");
        body.inert = false;
        body.removeAttribute("aria-hidden");
        window.smartCaptcha?.reset();
        contact.focus({ preventScroll: true });
    }

    form.addEventListener("change", event => {
        if (event.target.name === "channel") updateContact();
    });

    [contact, message].forEach(field => {
        field.addEventListener("input", () => {
            if (!field.classList.contains("is-invalid")) return;
            if (field.checkValidity()) {
                field.classList.remove("is-invalid");
                field.setAttribute("aria-invalid", "false");
                hideAlert();
            }
        });
    });

    again.addEventListener("click", resetForm);

    updateContact();
    submit.disabled = false;

    form.addEventListener("submit", async event => {

        event.preventDefault();

        if (form.classList.contains("is-sending") || form.classList.contains("is-sent")) return;

        hideAlert();

        if (!validate()) return;

        const data = new FormData(form);

        if (!data.get("smart-token")) {
            showAlert("Пройдите проверку «Я не робот» над кнопкой. Если она не загрузилась, напишите нам на почту или в Telegram.");
            return;
        }

        const sentChannel = channel();

        setSending(true);

        let error = "";

        try {
            const response = await fetch(form.action, { method: "POST", body: new URLSearchParams(data) });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.ok !== true) error = result.error || "default";
        } catch (e) {
            error = "network";
        }

        setSending(false);

        if (error) {
            showAlert(ERRORS[error] || ERRORS.default);
            window.smartCaptcha?.reset();
            return;
        }

        if (typeof window.ym === "function") window.ym(112266666, "reachGoal", "project_request_sent");

        showSuccess(sentChannel);
    });
}
