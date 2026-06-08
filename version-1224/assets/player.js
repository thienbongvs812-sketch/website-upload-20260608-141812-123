import { H as Hls } from './hls-dru42stk.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-player-button]');
  const status = player.querySelector('[data-player-status]');
  const streamUrl = player.dataset.stream;
  let hls = null;
  let attached = false;

  const showStatus = function (message) {
    if (!status) {
      return;
    }
    status.textContent = message;
    status.classList.add('show');
  };

  const hideStatus = function () {
    if (status) {
      status.classList.remove('show');
    }
  };

  const attachStream = function () {
    if (attached || !video || !streamUrl) {
      return Promise.resolve();
    }

    attached = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        hideStatus();
      });
      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          showStatus('网络连接异常，正在重新连接');
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          showStatus('播放中断，正在恢复');
          hls.recoverMediaError();
        } else {
          showStatus('播放暂不可用，请稍后重试');
        }
      });
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    showStatus('播放暂不可用，请更换浏览器再试');
    return Promise.resolve();
  };

  const play = function () {
    attachStream().then(function () {
      if (!video) {
        return;
      }
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showStatus('点击画面即可继续播放');
        });
      }
    });
  };

  if (button) {
    button.addEventListener('click', function () {
      player.classList.add('ready');
      play();
    });
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        player.classList.add('ready');
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('ready');
      hideStatus();
    });
    video.addEventListener('waiting', function () {
      showStatus('缓冲中');
    });
    video.addEventListener('playing', hideStatus);
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
