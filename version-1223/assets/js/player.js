(function () {
  function startPlayer(box) {
    var video = box.querySelector("video");
    var poster = box.querySelector(".player-poster");
    if (!video || box.getAttribute("data-started") === "1") {
      return;
    }

    var address = video.getAttribute("data-play");
    if (!address) {
      return;
    }

    box.setAttribute("data-started", "1");
    box.classList.add("is-playing");
    video.setAttribute("controls", "controls");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = address;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(address);
      hls.attachMedia(video);
    } else {
      video.src = address;
    }

    var play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(function () {});
    }

    if (poster) {
      poster.setAttribute("aria-hidden", "true");
    }
  }

  document.querySelectorAll("[data-player]").forEach(function (box) {
    var poster = box.querySelector(".player-poster");
    var video = box.querySelector("video");

    if (poster) {
      poster.addEventListener("click", function () {
        startPlayer(box);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (box.getAttribute("data-started") !== "1") {
          startPlayer(box);
        }
      });
    }
  });
})();
