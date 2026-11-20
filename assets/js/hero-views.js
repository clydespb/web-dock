function initHeroViews() {
    const hero = document.querySelector(".hero");
    const layer = hero?.querySelector(".hero__bg-image");
    if (!layer) return;

    const scenes = [null, "crane", "overhead"];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pictures = new Map();
    let current = 0;
    let timer;
    let generation = 0;
    let visible = false;

    function schedule() {
        clearTimeout(timer);
        generation++;
        if (visible && !document.hidden && !motion.matches) {
            timer = setTimeout(advance, 5000);
        }
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

    async function advance() {
        const sequence = generation;
        const index = (current + 1) % scenes.length;
        const scene = scenes[index];
        const next = scene ? getPicture(scene) : null;
        if (next) {
            try {
                await next.querySelector("img").decode();
            } catch {
                if (sequence !== generation) return;
                next.remove();
                pictures.delete(scene);
                return;
            }
        }
        if (sequence !== generation) return;
        for (const picture of pictures.values()) {
            picture.classList.toggle("is-active", picture === next);
        }
        current = index;
        schedule();
    }

    motion.addEventListener("change", schedule);
    document.addEventListener("visibilitychange", schedule);
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        schedule();
    }).observe(hero);
}
