function JoetoepRoomSelectInterface (joetoepClient) {
	this.joetoepClient = joetoepClient;
	
	var hash = window.location.hash,
		room = null,
		type = null;

	if (hash.length > 0) {
		if (hash.substring(0, 1) == '#') {
			hash = hash.substring(1, hash.length);
		}

		var hashParts = hash.split('/');
		if (hashParts.length >= 1) {
			var room = this.validateRoom(hashParts[0]) ? hashParts[0] : null;
			if (!room) {
				window.location.hash = '';
			}
		}
		if (hashParts.length >= 2) {
			var type = hashParts[1];

			if (type != 'remote' && type != 'player') {
				type = null;
			}
		}
	}

	if (!room) {
		this.showGUI();
	} else if (!type) {
		window.location.hash = '#'+room;
		this.showGUI(room);
		this.updateButtons();
	} else if (room && type == 'player') {
		this.connectPlayer(room);
	} else if (room && type == 'remote') {
		this.connectRemote(room);
	}
}

JoetoepRoomSelectInterface.prototype.showGUI = function (room) {
	$('#container').html(
		'<div id="room-select">' +
		  '<input id="room-name" type="text" placeholder="my-room">' +
		  '<button id="button-remote" disabled="disabled">Remote</button>' +
		  '<button id="button-player" disabled="disabled">Player</button>' +
		'</div>');

	this.roomNameEl = $('#room-name');
	this.remoteButtonEl = $('#button-remote');
	this.playerButtonEl = $('#button-player');

	if (room) {
		this.roomNameEl.val(room);
	}

	this.bindEvents();
}

JoetoepRoomSelectInterface.prototype.bindEvents = function () {
	var self = this;
	this.roomNameEl.keyup(function () { self.updateButtons() });
	this.roomNameEl.change(function () { self.updateButtons() });
	this.remoteButtonEl.click(function () { 
		self.connectRemote(self.roomNameEl.val());
	});
	this.playerButtonEl.click(function () { 
		self.connectPlayer(self.roomNameEl.val());
	});
}

JoetoepRoomSelectInterface.prototype.checkPlayerAllowed = function (room, callback) {
	this.joetoepClient.socket.emit('check-player', { room: room });

	this.joetoepClient.socket.once('check-player', function (data) {
		if (room == data.room) {
			callback(data);
		}
	});
}

JoetoepRoomSelectInterface.prototype.updateButtons = function () {
	var val = this.roomNameEl.val();

	if (val == this.lastTry)
		return;

	this.lastTry = val;

	if (this.validateRoom(val)) {
		this.remoteButtonEl.removeAttr('disabled');
		this.playerButtonEl.attr('disabled', 'disabled');
	} else {
		this.remoteButtonEl.attr('disabled', 'disabled');
		this.playerButtonEl.attr('disabled', 'disabled');
		return;
	}

	var self = this;
	(function (check) {
		setTimeout(function () {
			if (self.lastTry != check)
				return;

			self.checkPlayerAllowed(check, function (response) {
				if (response.allowed) {
					self.playerButtonEl.removeAttr('disabled');
				} else {
					self.playerButtonEl.attr('disabled', 'disabled');
				}
			});
		}, 300);
	})(val);
}

JoetoepRoomSelectInterface.prototype.validateRoom = function (room) {
	return room.match(/^[a-z-]+$/i);
}

JoetoepRoomSelectInterface.prototype.connectRemote = function (room) {
	if (this.validateRoom(room)) {
		this.joetoepClient.connectRemote(room);
	}
}

JoetoepRoomSelectInterface.prototype.connectPlayer = function (room) {
	if (this.validateRoom(room)) {
		var self = this;
		this.checkPlayerAllowed(room, function (response) {
			if (response.allowed) {
				self.joetoepClient.connectPlayer(room);
			}
		});
	}
}