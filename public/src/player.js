function JoetoepPlayerInterface (joetoepClient) {
	this.joetoepClient = joetoepClient;
	this.showGUI();
}

JoetoepPlayerInterface.prototype.showGUI = function () {
	$('#nowplaying').after(
		'<div id="youtube-container">' +
          '<div id="youtube"></div>' +
          '<div id="focus-disabler"></div>' +
        '</div>');

	var self = this;
	$(window).on('resize', function () {
		self.resizeContainer();
	});

	this.resizeContainer();
	this.connectToYoutube();
}

JoetoepPlayerInterface.prototype.resizeContainer = function  () {
	var ytc = $('#youtube-container');
	var width = ytc.width();
	var height = Math.round(width * 9 / 16);

	if (ytc.height() != height) {
		ytc.height(height);
	} 
}

JoetoepPlayerInterface.prototype.makeScreenSmall = function () {
	if ($('#player-attached').hasClass('big')) {
		$('#player-attached').removeClass('big');
		$('#youtube-container').height(Math.round($('#youtube-container').height() / 2));
	}

	var self = this;
	setTimeout(function () {
		self.resizeContainer();
	}, 510);
}

JoetoepPlayerInterface.prototype.makeScreenBig = function () {
	if (!$('#player-attached').hasClass('big')) {
		$('#player-attached').addClass('big');
		$('#youtube-container').height($('#youtube-container').height() * 2);
	}

	var self = this;
	setTimeout(function () {
		self.resizeContainer();
	}, 510);
}

JoetoepPlayerInterface.prototype.connectToYoutube = function () {
	var self = this;
	window.onYouTubeIframeAPIReady = function () {
		self.youtube = new YT.Player('youtube', {
			height: '100%',
			width: '100%',
			playerVars: {
				'controls': 0,
				'disablekb': 1,
				'showinfo': 0,
				'rel': 0,
				'iv_load_policy': 3,
				'enablejsapi': 1,
				'origin': self.joetoepClient.config.host
			}
		});
	}

	if (YT) {
		window.onYouTubeIframeAPIReady();
	}
}