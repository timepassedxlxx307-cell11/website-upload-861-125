(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    blocks.forEach(function (block) {
      var video = block.querySelector('video');
      var cover = block.querySelector('.player-cover');
      var button = block.querySelector('.player-start');
      var url = block.getAttribute('data-url');
      var loaded = false;
      var hlsInstance = null;

      function bindVideo() {
        if (!video || !url || loaded) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          loaded = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          loaded = true;
          return;
        }

        video.src = url;
        loaded = true;
      }

      function playVideo() {
        bindVideo();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (video) {
          video.controls = true;
          var action = video.play();
          if (action && action.catch) {
            action.catch(function () {
              if (cover) {
                cover.classList.remove('is-hidden');
              }
            });
          }
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          playVideo();
        });
      }

      if (cover) {
        cover.addEventListener('click', function () {
          playVideo();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo();
          } else {
            video.pause();
          }
        });
        video.addEventListener('ended', function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
}());
