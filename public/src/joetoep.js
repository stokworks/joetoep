function JoetoepClient (config) {
	this.config = config;
	this.socket = io.connect(config.host);
	this.interface = [new JoetoepRoomSelectInterface(this)];
}

JoetoepClient.prototype.connectRemote = function (room) {
	window.location.hash = '#'+room+'/remote';

	var self = this;
	this.socket.emit('become-remote', {room: room});
	this.socket.once('become-remote', function (data) {
		if (data.allowed && data.room == room) {
			self.room = room
			self.interface = [
				new JoetoepSharedInterface(self),
				new JoetoepRemoteInterface(self)
			];
		}
	});
}

JoetoepClient.prototype.connectPlayer = function (room) {
	window.location.hash = '#'+room+'/player';

	var self = this;
	this.socket.emit('become-player', {room: room});
	this.socket.once('become-player', function (data) {
		if (data.allowed && data.room == room) {
			self.interface = [
				new JoetoepSharedInterface(self),
				new JoetoepPlayerInterface(self)
			];
		}
	});
}