function JoetoepServer (io) {
	this.io    = io;
	this.rooms = [];

	this.listen();
}

JoetoepServer.prototype.listen = function () {
	this.io.sockets.on('connection', function (socket) {
		socket.on('check-player', function (data) {
			data.allowed = true;
			socket.emit('check-player', data);
		});
		socket.on('become-remote', function (data) {
			data.allowed = true;
			socket.emit('become-remote', data);
		});
		socket.on('become-player', function (data) {
			data.allowed = true;
			socket.emit('become-player', data);
		});
	});
}

function JoetoepRoom (name) {
	this.name = name;
}

module.exports = JoetoepServer;