(function () {
    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playerOverlay");
        var attached = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    backBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            attached = true;
        }

        function startPlayer() {
            attachSource();
            video.controls = true;

            if (overlay) {
                overlay.classList.add("player-overlay-hidden");
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayer);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayer();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
})();
