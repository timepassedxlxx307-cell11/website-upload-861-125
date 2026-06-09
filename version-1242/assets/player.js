(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = document.querySelectorAll('[data-hls-player]');

    players.forEach(function (video) {
      var wrapper = video.closest('.player-box');
      var button = wrapper ? wrapper.querySelector('[data-play-trigger]') : null;
      var status = document.querySelector('[data-player-status]');
      var source = video.getAttribute('data-m3u8');
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initialize() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('播放源已连接，正在启动播放器。');
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          window.__currentHlsPlayer = hls;
          setStatus('HLS 播放源已加载，正在启动播放器。');
          return Promise.resolve();
        }

        video.src = source;
        setStatus('浏览器将尝试直接加载播放源。');
        return Promise.resolve();
      }

      function play() {
        initialize().then(function () {
          var playPromise = video.play();

          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('play', function () {
        if (wrapper) {
          wrapper.classList.add('is-playing');
        }
        setStatus('正在播放。');
      });

      video.addEventListener('pause', function () {
        if (wrapper) {
          wrapper.classList.remove('is-playing');
        }
      });

      video.addEventListener('error', function () {
        setStatus('播放源暂时无法连接，请稍后重试或更换浏览器。');
      });
    });
  });
})();
