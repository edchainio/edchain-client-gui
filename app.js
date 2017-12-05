var electron = require('electron'); // http://electron.atom.io/docs/api
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var log = require('electron-log');
const pubsub = require('electron-pubsub');

var ipfs = require('./process_ipfs')();

var ipcMain=require('electron').ipcMain;
const { exec } = require('child_process');

const { app, BrowserWindow, Menu, Tray } = electron;

let mainWindow;
let addWindow;
let settingsWindow;

var __windows = {};

for(let prop in ipfs){
    if(typeof ipfs[prop] === 'function'){
        pubsub.subscribe("ipfs:" + prop, ipfs[prop]);
    }    
}

var createWindow = function createWindow(config){
    var browserWindow = new BrowserWindow(config);
    var __id = browserWindow.id;
    __windows[__id] = browserWindow;
    browserWindow.on('closed', function(){
        __windows[__id] = null;
    });
    return browserWindow;
};

var createMainWindow = function createMainWindow(){
    mainWindow = createWindow({
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

    //  mainWindow.openDevTools();
   
    ipcMain.on('createAndShowChildWindow', function(event,url){
        // Is it really a good idea 
        // to just spawn windows like this?
        // Should they be tracked?
        showChildWindow(createChildWindow(mainWindow,url));
    });

    ipcMain.on('createChildWindow', function(event,url){
        settingsWindow = createChildWindow(mainWindow,url);
        settingsWindow.on("show", function(){
            ipfsChildLog();
        });
    });

    ipcMain.on('showChildWindow', function(){
        showChildWindow(settingsWindow);
    });

    pubsub.subscribe('ipfs:logging', function(event,val){
        ipfsChildLog(val);
    });
};

app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        ipfs.stop();
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!__windows.length) {
        createMainWindow();
    }
})

var ipfsChildLog = (function(){
    var __log = [];
    return function ipfsChildLog(value){
        if(value){
            __log.push(value.toString());
        }
        if(settingsWindow){          
            pubsub.publish("ipfsChildLog", __log);        
        }
    }
})();


function createAddWindow() {
    addWindow = createWindow({
        // width and height are not defined
        width,
        height,
        title: 'Single Course pane'
    });
    // Need to make course.html 
    // What is going on here?
    addWindow.loadURL(`file://${__dirname}/course.html`);
    return addWindow;
};

var createChildWindow = function (mainWindow, url) {
    
    var child = createWindow({
        parent: mainWindow, 
        modal:true, 
        show:false
    });
    child.loadURL(url);
    return child;

};

var showChildWindow= function(browserWindow){
 
    browserWindow.show();
   // browserWindow.openDevTools();
     // log.info(browserWindow.webContents); 
};

