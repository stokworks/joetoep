(function ($) {
  var methods = {
    init: function init(options) {
      var $this = this;

      var id        = $this.attr('id');
      var replaceId = $this.children().attr('id');
      
      $this.data('ready', false);

      var fnNameReady = 'onYouTubeReady$' + replaceId;
      window[fnNameReady] = function () {
        $this.data('ready', true);
		$this.trigger('ready');
      }

      var fnNameStateChange = 'onYouTubeStateChange$' + replaceId;
      window[fnNameStateChange] = function (newState) {
        $this.trigger('stateChange', [newState]);
      }
      
      var fnNamePlaybackQualityChange = 'onYouTubePlaybackQualityChange$' + replaceId;
      window[fnNamePlaybackQualityChange] = function (newPlaybackQuality) {
        $this.trigger('qualityChange', [newPlaybackQuality]);
      }

      var fnNameError = 'onYouTubeError$' + replaceId;
      window[fnNameError] = function (error) {
        $this.trigger('error', [error]);
      }

      window.onYouTubeIframeAPIReady = function () {
        player = new YT.Player('player', {
          height: '100%',
          width: '100%',
          events: {
            'onReady': fnNameReady,
            'onStateChange': fnNameStateChange,
            'onPlaybackQualityChange': fnNamePlaybackQualityChange,
            'onError': fnNameError
          },
          playerVars: {
            controls:       0,
            showinfo:       0,
            rel:            0,
            iv_load_policy: 3,
            disablekb     : 1
          }
        });

        $this.data('api', player);
      }

      $this.css('position', 'relative');
      $this.append(
        '<div style="position: absolute; width: 100%; height: 100%; z-index: 1; top: 0;"></div>'
      );

      return $this;
    },

    play: function play(videoId, quality) {
      return $(this).data('api').loadVideoById({ videoId: videoId, suggestedQuality: quality });
    },

    load: function load(videoId, quality) {
      return $(this).data('api').cueVideoById({ videoId: videoId, suggestedQuality: quality })
    },

    playVideo: function playVideo() {
      return $(this).data('api').playVideo();
    },

    pauseVideo: function pauseVideo() {
      return $(this).data('api').pauseVideo();
    },

    seekTo: function seekTo(seconds, allowSeekAhead) {
      return $(this).data('api').seekTo(seconds, allowSeekAhead);
    },

    getState: function getState() {
      return $(this).data('api').getPlayerState();
    },

    isReady: function isReady() {
      return $(this).data('ready');
    }
  }

  $.fn.player = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.player');
    }
  }
})(jQuery);

