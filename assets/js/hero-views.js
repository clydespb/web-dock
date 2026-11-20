function initHeroViews() {
    const controls = document.querySelector(".hero__views");
    const layer = document.querySelector(".hero__bg-image");
    if (!controls || !layer) return;

    const views = Array.from(controls.querySelectorAll(".hero__view"));
    const play = controls.querySelector(".hero__play");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pictures = new Map();
    let current = 0;
    let request = 0;
    let timer;
    let visible = false;
    let playing = !motion.matches;

    function schedule() {
        clearTimeout(timer);
        if (playing && visible && !document.hidden) {
            timer = setTimeout(() => select((current + 1) % views.length), 5000);
        }
    }

    function setPlaying(enabled) {
        playing = enabled;
        play.classList.toggle("is-paused", !playing);
        const label = playing ? "Приостановить смену ракурсов" : "Включить смену ракурсов";
        play.setAttribute("aria-label", label);
        play.title = label;
        schedule();
    }

    function getPicture(scene) {
        if (!pictures.has(scene)) {
            const picture = document.createElement("picture");
            const source = document.createElement("source");
            source.media = "(max-width:768px)";
            source.srcset = "assets/img/hero-" + scene + "-mobile.webp";
            const img = document.createElement("img");
            img.alt = "";
            picture.append(source, img);
            img.src = "assets/img/hero-" + scene + ".webp";
            layer.append(picture);
            pictures.set(scene, picture);
        }
        return pictures.get(scene);
    }

    async function select(index) {
        const sequence = ++request;
        clearTimeout(timer);
        const scene = views[index].dataset.scene;
        const next = scene ? getPicture(scene) : null;
        if (next) {
            try {
                await next.querySelector("img").decode();
            } catch {
                if (sequence !== request) return;
                next.remove();
                pictures.delete(scene);
                setPlaying(false);
                return;
            }
        }
        if (sequence !== request) return;
        for (const picture of pictures.values()) {
            picture.classList.toggle("is-active", picture === next);
        }
        views[current].setAttribute("aria-pressed", "false");
        views[index].setAttribute("aria-pressed", "true");
        current = index;
        schedule();
    }

    views.forEach((button, index) => {
        button.title = button.getAttribute("aria-label");
        button.addEventListener("click", () => {
            setPlaying(false);
            select(index);
        });
    });
    play.addEventListener("click", () => {
        ++request;
        setPlaying(!playing);
    });
    motion.addEventListener("change", () => {
        if (motion.matches) {
            ++request;
            setPlaying(false);
        }
    });
    document.addEventListener("visibilitychange", schedule);
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        schedule();
    }).observe(controls.closest(".hero"));
    setPlaying(playing);
    controls.hidden = false;
}
