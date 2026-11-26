(function initContact() {
    const form = document.querySelector(".project-form");
    if (!form) return;
    const {channel, contact} = form.elements;
    const status = form.querySelector('[role="status"]');
    const submit = form.querySelector("button");
    function updateContact() {
        const email = channel.value === "email";
        form.querySelector("#contact-label").textContent = email ? "Ваш email" : "Ваше имя пользователя в Telegram";
        contact.type = email ? "email" : "text";
        contact.autocomplete = email ? "email" : "off";
        contact.placeholder = email ? "name@example.ru" : "@username";
        contact.pattern = email ? ".+" : "@?[A-Za-z0-9_]{1,32}";
    }
    channel.addEventListener("change", updateContact);
    updateContact();
    submit.disabled = false;
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (submit.disabled) return;
        const data = new FormData(form);
        if (!data.get("smart-token")) {
            status.textContent = "Пройдите проверку Я не робот. Если она недоступна, напишите нам по ссылке ниже.";
            return;
        }
        submit.disabled = true;
        status.textContent = "Отправляем заявку…";
        try {
            const response = await fetch(form.action, {method:"POST", body:new URLSearchParams(data)});
            const result = await response.json().catch(() => ({}));
            if (!response.ok || result.ok !== true) throw new Error(result.error || "");
            form.reset();
            updateContact();
            status.textContent = data.get("channel") === "email" ? "Спасибо! Ответим на указанную почту" : "Спасибо! Напишем вам в Telegram";
            if (typeof window.ym === "function") window.ym(112266666, "reachGoal", "project_request_sent");
        } catch (error) {
            const messages = {
                invalid: "Проверьте, что контакт и описание задачи заполнены верно.",
                captcha_failed: "Проверка «Я не робот» не прошла. Пройдите её ещё раз и отправьте заявку.",
                captcha_host: "Проверка «Я не робот» не прошла. Пройдите её ещё раз и отправьте заявку.",
                rate_limit: "Слишком много попыток подряд. Попробуйте через 10 минут или напишите нам напрямую."
            };
            status.textContent = messages[error.message] || "Не удалось подтвердить отправку. Попробуйте позже или напишите нам напрямую.";
        } finally {
            submit.disabled = false;
            window.smartCaptcha?.reset();
        }
    });
})();
