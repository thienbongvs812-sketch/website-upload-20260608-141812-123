import { H as Hls } from "./hls.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const setupMenu = () => {
  const button = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-mobile-nav]");
  if (!button || !nav) {
    return;
  }
  button.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
};

const setupSearch = () => {
  const input = document.querySelector("[data-search-input]");
  if (!input) {
    return;
  }
  const items = Array.from(document.querySelectorAll(".movie-card, .rank-item"));
  input.addEventListener("input", () => {
    const keyword = normalize(input.value);
    items.forEach((item) => {
      const text = normalize([
        item.dataset.title,
        item.dataset.year,
        item.dataset.type,
        item.dataset.region,
        item.dataset.genre,
        item.textContent
      ].join(" "));
      item.classList.toggle("hidden", keyword && !text.includes(keyword));
    });
  });
};

const setupImages = () => {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.removeAttribute("src");
      image.setAttribute("aria-hidden", "true");
    });
  });
};

const setupHero = () => {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const previous = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  const show = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  };

  const play = () => {
    clearInterval(timer);
    timer = setInterval(() => show(activeIndex + 1), 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot));
      play();
    });
  });

  previous?.addEventListener("click", () => {
    show(activeIndex - 1);
    play();
  });

  next?.addEventListener("click", () => {
    show(activeIndex + 1);
    play();
  });

  show(0);
  play();
};

const playVideo = (video, source) => {
  if (!video || !source) {
    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    if (video.src !== source) {
      video.src = source;
    }
    video.play().catch(() => {});
    return;
  }

  if (Hls.isSupported()) {
    if (video.hlsInstance) {
      video.hlsInstance.destroy();
    }
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    video.hlsInstance = hls;
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
    });
    return;
  }

  video.src = source;
  video.play().catch(() => {});
};

const setupPlayers = () => {
  document.querySelectorAll(".player-panel").forEach((panel) => {
    const video = panel.querySelector("video");
    const button = panel.querySelector("[data-play-button]");
    const source = video?.dataset.videoSource;
    const start = () => {
      button?.classList.add("hidden");
      playVideo(video, source);
    };
    button?.addEventListener("click", start);
    video?.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
    video?.addEventListener("play", () => {
      button?.classList.add("hidden");
    });
  });
};

ready(() => {
  setupMenu();
  setupSearch();
  setupImages();
  setupHero();
  setupPlayers();
});
