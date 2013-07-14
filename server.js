var joetoep  = require('./lib/joetoep.js'),
	socketio = require('socket.io'),
	send     = require('send'),
	http     = require('http'),
	url      = require('url'),
	fs       = require('fs');

var config = JSON.parse(fs.readFileSync('config.json'), 'utf8');
var clientConfig  = 
	'$(function () { ' +
		'window.joetoep = new JoetoepClient(' + 
		JSON.stringify(config.clientConfig) + '); });';

var clientFiles = './public/';

var app = http.createServer(function (req, res) {
	var requrl = url.parse(req.url);

	if (req.headers['host'] != url.parse(config.clientConfig.host).host) {
		res.writeHead(301, { 'Location': config.clientConfig.host });
		res.end();
		return;
	}

	if (requrl.path == '/config.js') {
		res.writeHead(200, {
			'Content-Length': clientConfig.length,
			'Content-Type': 'application/javascript' });
		res.end(clientConfig, 'utf-8');
	} else {
		send(req, req.url)
			.from(clientFiles)
			.pipe(res);
	}
});

var io = socketio.listen(app);

io.enable('browser client etag');
io.set('log level', 1);
io.set('transports', ['xhr-polling', 'jsonp-polling']);

joetoep = new joetoep(io);

app.listen(config.port);