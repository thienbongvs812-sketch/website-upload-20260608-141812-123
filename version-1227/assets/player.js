(function () {
    function setupPlayer(streamUrl, videoId, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var started = false;
        if (!video || !streamUrl) {
            return;
        }

        function start() {
            if (started) {
                return video.play().catch(function () {});
            }
            started = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return video.play().catch(function () {});
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = streamUrl;
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    window.setupPlayer = setupPlayer;
}());
