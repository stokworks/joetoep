(function ($) {
  var methods = {
    init: function init(options) {
      var id        = $(this).attr('id');
      var replaceId = $(this).children().attr('id');

      var width = (options.width ? options.width : '100%');
      var height = (options.height ? options.height : '100%');

      var params = { allowScriptAccess: 'always' };
      var atts = { id: replaceId };
      swfobject.embedSWF(
        'http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=' + id + '&version=3',
        replaceId, width, height, '8', null, null, params, atts);

      var $this = $(this);
      $this.data('ready', false);

      eventYouTubePlayerReady(id, function (player) {
        $this.data('api', player);

        var fnNameStateChange = 'onYouTubeStateChange' + player.id;
        window[fnNameStateChange] = function (newState) {
          $this.trigger('stateChange', [newState]);
        }
        player.addEventListener('onStateChange', fnNameStateChange);
        
        var fnNamePlaybackQualityChange = 'onYouTubePlaybackQualityChange' + player.id;
        window[fnNamePlaybackQualityChange] = function (newPlaybackQuality) {
          $this.trigger('qualityChange', [newPlaybackQuality]);
        }
        player.addEventListener('onPlaybackQualityChange', fnNamePlaybackQualityChange);

        var fnNameError = 'onYouTubeError' + player.id;
        window[fnNameError] = function (error) {
          $this.trigger('error', [error]);
        }
        player.addEventListener('onError', fnNameError);

        $this.data('ready', true);
        $this.trigger('ready');
      });

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

  var eventYouTubePlayerReadyCallbacks = [];
  var eventYouTubePlayerReady = function (playerId, callback) {
    if (callback) {
      eventYouTubePlayerReadyCallbacks.push({ playerId: playerId, callback: callback });
    } else {
      eventYouTubePlayerReadyCallbacks.forEach(function (cb) {
        if (playerId === cb.playerId) {
          cb.callback($('#' + playerId).children().get(0));
        }
      });
    }
  }

  window.onYouTubePlayerReady = function (playerId) {
    eventYouTubePlayerReady(playerId);
  }
})(jQuery);

