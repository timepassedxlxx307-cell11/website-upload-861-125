(function () {
    function mountMoviePlayer(videoId, layerId, streamUrl) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var hlsInstance = null;
        var loaded = false;

        if (!video) {
            return;
        }

        var loadStream = function () {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        };

        var start = function () {
            loadStream();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        };

        if (layer) {
            layer.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.mountMoviePlayer = mountMoviePlayer;
}());
