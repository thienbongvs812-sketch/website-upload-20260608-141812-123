import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function setStatus(element, message) {
    if (element) {
        element.textContent = message;
    }
}

function setupPlayer() {
    const video = document.querySelector('#movie-player');

    if (!video) {
        return;
    }

    const shell = video.closest('.player-shell');
    const source = video.dataset.source || '';
    const status = document.querySelector('[data-player-status]');
    const toggleButtons = Array.from(document.querySelectorAll('[data-player-toggle]'));
    const muteButton = document.querySelector('[data-player-mute]');
    const fullscreenButton = document.querySelector('[data-player-fullscreen]');
    let hlsInstance = null;

    if (source && Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(status, '播放源加载完成');
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                setStatus(status, '播放源连接异常，请稍后重试');
            }
        });
    } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus(status, '播放源加载完成');
    } else if (source) {
        video.src = source;
        setStatus(status, '播放源已绑定');
    } else {
        setStatus(status, '未找到播放源');
    }

    function syncState() {
        if (shell) {
            shell.classList.toggle('is-playing', !video.paused && !video.ended);
        }
    }

    function togglePlay() {
        if (video.paused || video.ended) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setStatus(status, '点击播放器后即可继续播放');
                });
            }
        } else {
            video.pause();
        }
        syncState();
    }

    toggleButtons.forEach(function (button) {
        button.addEventListener('click', togglePlay);
    });

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', syncState);
    video.addEventListener('pause', syncState);
    video.addEventListener('ended', syncState);

    if (muteButton) {
        muteButton.addEventListener('click', function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', function () {
            const target = shell || video;
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (target.requestFullscreen) {
                target.requestFullscreen();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

ready(setupPlayer);
