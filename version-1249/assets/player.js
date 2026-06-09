(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function () {
    var video = document.getElementById('movie-player');
    var playButton = document.querySelector('[data-play-button]');
    var urlNode = document.getElementById('stream-url');
    var streamUrl = urlNode ? urlNode.textContent.trim() : '';
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          hls.destroy();
        });
      }
    }

    function startPlayback() {
      attachStream();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
        });
      }
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
        return;
      }
      video.pause();
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
