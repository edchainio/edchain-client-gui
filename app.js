var electron = require('electron'); // http://electron.atom.io/docs/api
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var log = require('electron-log');
/*var mcnode = require('./process_mcnode')();*/
var ipfs = require('./process_ipfs')();

var ipcMain=require('electron').ipcMain;
const { exec } = require('child_process');

const ipfsPath = path.resolve(__dirname,'./','bin','linux','ipfs daemon')
const mcnodePath = path.resolve(__dirname,'./','bin','linux','mcnode -d $PWD/ip4/104.236.125.197/tcp/9000/p2p/QmRXjzUbsTHYa9t4z47B7tR7zsfAKq3iCkvAdN3NKigWPn')


const { app, BrowserWindow, Menu, Tray } = electron;

let mainWindow;
let addWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 960,
        height: 540,
        //frame: false,
        icon: __dirname + '/static/img/icon.png'
    });
//    createChildWindow(mainWindow);
    const tray = new Tray(__dirname + '/static/img/icon.png');

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

    /*mainWindow.loadURL(`file://${__dirname}/src/html/settings.html`);*/
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
         ipfs.stop();
         process.exit(1);
    });
    mainWindow.openDevTools();
   
   
    ipcMain.on('openChildWindow', function(event,url){

        createChildWindow(mainWindow,url);
    });



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


var createChildWindow= function (mainWindow,url) {
    
    var child= new BrowserWindow({parent: mainWindow, modal:true, show:false});
    child.loadURL('file://'+url);
    child.once('ready-to-show', () => {
        child.show();
        child.openDevTools();
    });

}
//ipcMain.on('course:audit', (event, course) => {
//    mainWindow.webContents.send('course:audit', course);
//    addWindow.close();
//});
