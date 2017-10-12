var electron = require('electron'); // http://electron.atom.io/docs/api
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html

var mcnode = require('./process_mcnode');
// var mcnode = require('./process_ipfs');


const { app, BrowserWindow, Menu, ipcMain, Tray } = electron;

const elasticsearch = require('elasticsearch');

let mainWindow;
let addWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 960,
        height: 540,
        //frame: false,
        icon: __dirname + '/static/img/fav.png'
    });

    const tray = new Tray(__dirname + '/static/img/fav.png');

    mainWindow.tray = tray;

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });

    mainWindow.on('show', () => {
        tray.setHighlightMode('always');
    });

    mainWindow.on('hide', () => {
        tray.setHighlightMode('never');
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

//    mainWindow.once('ready-to-show', () => {
//        mainWindow.show();
//    });

    mainWindow.on('closed', () => app.quit());

//    const mainMenu = Menu.buildFromTemplate(menuTemplate);
//    Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
    addWindow = new BrowserWindow({
        width,
        height,
        title: 'Single Course pane'
    });
// Need to make course.html
    addWindow.loadURL(`file://${__dirname}/course.html`);
    addWindow.on('closed', () => addWindow = null);
}

//ipcMain.on('course:audit', (event, course) => {
//    mainWindow.webContents.send('course:audit', course);
//    addWindow.close();
//});

