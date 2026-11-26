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
            const result = await response.json();
            if (!response.ok || result.ok !== true) throw new Error();
            form.reset();
            updateContact();
            status.textContent = data.get("channel") === "email" ? "Спасибо! Ответим на указанную почту" : "Спасибо! Напишем вам в Telegram";
            if (typeof window.ym === "function") window.ym(112266666, "reachGoal", "project_request_sent");
        } catch {
            status.textContent = "Не удалось подтвердить отправку. Попробуйте позже или напишите нам напрямую.";
        } finally {
            submit.disabled = false;
            window.smartCaptcha?.reset();
        }
    });
})();
