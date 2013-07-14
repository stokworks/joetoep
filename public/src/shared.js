function JoetoepSharedInterface (joetoepClient) {
	this.joetoepClient = joetoepClient;
	this.showGUI();
}

JoetoepSharedInterface.prototype.showGUI = function () {
	$('#container').html(
		'<div id="player" class="main">' +
        '<div id="player-attached">' +
          '<div id="nowplaying">Dragonforce - Cry Thunder</div>' +
          '<div id="progress">' +
            '<div id="progress-loaded"></div>' +
            '<div id="progress-percentage"></div>' +
            '<div id="progress-control"></div>' +
            '<div id="progress-label1">1:14</div>' +
            '<div id="progress-label2">2:35</div>' +
          '</div>' +
          '<div id="controls">' +
            '<div id="controls-playpause" class="play"></div>' +
            '<div id="controls-skip"></div>' +
            '<div id="controls-volume"></div>' +
            '<div id="controls-quality"></div>' +
            '<div id="controls-smallscreen"></div>' +
            '<div id="controls-bigscreen"></div>' +
            '<div id="controls-fullscreen"></div>' +
          '</div>' +
        '</div>' +
        '<div class="collumn left">' +
          '<div id="room-info">' +
            '<h2>Room: stok</h2>' +
          '</div>' +
          '<div id="search-input">' +
            '<input type="text" placeholder="Search videos...">' +
          '</div>' +
          '<div id="search-result"></div>' +
        '</div>' +
        '<div id="collumn-right" class="collumn right">' +
          '<div id="playlist"></div>' +
        '</div>' +
      '</div>');
}