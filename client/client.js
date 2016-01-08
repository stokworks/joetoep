function JoeToepInterface(config) {
	var self = this;

	this.socket = io.connect(config.host, {
		transports: ['xhr-multipart', 'xhr-polling', 'jsonp-polling']
	});
	this.$container = $('#container');

	this.roomSelectorTemplate = _.template($('#room-selector-template').html());
	this.typeSelectorTemplate = _.template($('#type-selector-template').html());
	this.inRoomTemplate       = _.template($('#in-room-template').html());

	this.interface;

	this.initRoomSelectUI = function() {
		self.$container.html(
			self.roomSelectorTemplate()
		);

		$('#room-form').submit(function (e) {
			var room = $('#room-input').val();
			
			if (self.joinRoom(room)) {
				self.initTypeSelectUI();

				window.location.hash = '#' + room
			}

			e.preventDefault();
			return false;
		});
	}

	this.initTypeSelectUI = function() {
		self.$container.html(
			self.typeSelectorTemplate()
		);

		$('#type-player').click(function() {
			self.setType(true);
			window.location.hash = window.location.hash + '/player';
		});

		$('#type-remote').click(function() {
			self.setType(false);
			window.location.hash = window.location.hash + '/remote';
		});
	}

	this.initInRoomUI = function(isPlayer) {
		self.$container.html(
			self.inRoomTemplate({ isPlayer: isPlayer })
		);

		self.$container.addClass(isPlayer ? 'player' : 'client');
	}

	this.joinRoom = function (room) {
		if (/^[A-Za-z0-9-]+$/.test(room)) {
			self.socket.emit('subscribe', room);

			self.socket.on('reconnect', function () {
				self.socket.emit('subscribe', room);
			});

			return true;
		}

		return false;
	}

	this.setType = function (isPlayer) {
		self.initInRoomUI(isPlayer);

		if (isPlayer) 
			self.interface = new JoeToepPlayer(new JoeToepRemote(self));
		else
			self.interface = new JoeToepRemote(self);
	}

	this.init = function () {
		$(window).on('hashchange', function() {
			location.reload();
		});

		var hash = (window.location.hash.substr(0, 1) == '#') ? 
						window.location.hash.substr(1) :
						window.location.hash;

		var hashParts = hash.split('/');

		if (hashParts.length > 0) {
			var room = hashParts.shift();

			if (self.joinRoom(room)) {
				if (hashParts.length > 0) {
					var type = hashParts.shift();

					if (type == 'remote') {
						return self.setType(false);
					} else if (type == 'player') {
						return self.setType(true);
					}
				} else {
					return self.initTypeSelectUI();
				}
			}
		}

		self.initRoomSelectUI();
	}

	this.init();
}

function JoeToepRemote(joeToepInterface) {
	var self = this;

	this.socket = joeToepInterface.socket;

	this.$searchForm    = $('#search-form');
	this.$searchInput   = $('#search-input');
	this.$searchResults = $('#search-results');
	this.lastQuery;

	this.$playlist      = $('#playlist');

	this.$pauseplay     = $('#control-pauseplay');
	this.$skip          = $('#control-skip');

	this.$searchForm.submit(function (e) {
		var query = self.$searchInput.val();
		self.lastQuery = query;

		self.socket.emit('search', { query: query });

		e.preventDefault();
		return false;
	});

	$(document).keypress(function (e) {
		if ( $(e.target).is("input") ) return;

		switch (e.which) {
			case 112:
				self.socket.emit('pauseplay');
				break;
			case 115:
				self.socket.emit('skip');
				break;
		}
	});

	this.$pauseplay.click(function () {
		self.socket.emit('pauseplay');
	});

	this.$skip.click(function () {
		self.socket.emit('skip');
	});

	this.socket.on('search-results', function (data) {
		if (data.query == self.lastQuery) {
			self.$searchResults.empty();

			data.results.forEach(function (result) {
				var el = $('<div class="cf"></div>')
							.text(result.title);

				el.prepend('<img src="'+result.thumb+'">');

				self.$searchResults.append(el);

				el.click(function () {
					self.socket.emit('add', result);
				});
			});
		}
	});

	this.socket.on('playlist', function (data) {
		self.$playlist.empty();

		data.forEach(function (result) {
			var el = $('<div class="cf"></div>')
							.text(result.title);

			el.prepend('<img src="'+result.thumb+'">');

			self.$playlist.append(el);
		});
	});

	this.socket.emit('get-playlist');
}

function JoeToepPlayer(joeToepRemote) {
	var self = this;

	this.$fullscreen = $('#control-fullscreen');
	this.$player     = $('#player-container');

	this.socket = joeToepRemote.socket;
	this.playlist = [];

	this.playAllowed = true;

	this.init = function () {
		this.$player.on('ready', function () {
			self.playstateChanged();
		});

		this.$player.on('stateChange', function () {
			self.playstateChanged();
		});

		this.$player.on('error', function (e, error) {
			console.log(error);
		});

		this.$player.player();
	}

	this.playlistChanged = function () {
		if (this.$player.player('isReady')) {
			var state = this.$player.player('getState');

			if (state == -1 || state == 0 || state == 5) {
				this.playNextSong();
			}
		}
	}

	this.playstateChanged = function () {
		var state = this.$player.player('getState');
		
		console.log('State: ' + state);

		if (state == -1 || state == 0) {
			this.playNextSong();
		}
	}

	this.playNextSong = function () {
		if (this.playlist.length > 0) {
			if (this.playAllowed) {
				this.playAllowed = false;
				this.playSong(this.playlist.shift().id);
				this.socket.emit('consume');

				setTimeout(function () { self.playAllowed = true; }, 1000);
			}
		}
	}

	this.playSong = function (id) {
		this.$player.player('play', id, 'hd720');
	}

	this.goFullscreen = function () {
		var elem = document.getElementById('player-container');
		if (elem.requestFullScreen) {
			elem.requestFullScreen();
		} else if (elem.mozRequestFullScreen) {
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullScreen) {
			elem.webkitRequestFullScreen();
		}
	}

	this.socket.on('playlist', function (data) {
		self.playlist = data;
		self.playlistChanged();
	});

	this.socket.on('pauseplay', function () {
		var state = self.$player.player('getState');
		
		if (state == 2) {
			self.$player.player('playVideo');
		} else {
			self.$player.player('pauseVideo');
		}
	});

	this.socket.on('skip', function () {
		self.playNextSong();
	});

	this.$fullscreen.click(function () {
		self.goFullscreen();
	});

	$(document).keypress(function (e) {
		if ( $("*:focus").is("textarea, input") ) return;
		
		switch (e.keyCode) {
			case 102:
				self.goFullscreen();
				break;
		}
	});

	this.init();
}
