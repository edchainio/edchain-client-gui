var electron = require('electron'); // http://electron.atom.io/docs/api
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html

var mcnode = require('./process_mcnode');

var window = null;

const {BrowserWindow, Tray} = electron

// Wait until the app is ready
electron.app.once('ready', function () {
  // Create a new window
  window = new electron.BrowserWindow({
    // Set the initial width to 500px
    width: 1000,
    // Set the initial height to 400px
    height: 500,
    // skipTaskbar: true,
    // Show the minimize/maximize buttons inset in the window on macOS
    // titleBarStyle: 'hidden-inset',
    // Set the default background color of the window to match the CSS
    // background color of the page, this prevents any white flickering
    // backgroundColor: "#111",
    // Don't show the window until it ready, this prevents any white flickering
    // show: false
    icon: __dirname + '/static/img/icon.png'
  });

  const tray = new Tray(__dirname + '/static/img/icon.png')

  window.tray = tray;

  tray.on('click', () => {
    window.isVisible() ? window.hide() : window.show()
  })
  window.on('show', () => {
    tray.setHighlightMode('always')
  })
  window.on('hide', () => {
    tray.setHighlightMode('never')
  })
  // Load a URL in the window to the local index.html path
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Show window when page is ready
  window.once('ready-to-show', function () {
    window.show();
  });
});
