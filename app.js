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

for(let prop in ipfs){
    if(typeof ipfs[prop] === 'function'){
        pubsub.subscribe("ipfs:" + prop, ipfs[prop]);
    }    
}


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


});

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
    addWindow = new BrowserWindow({
        width,
        height,
        title: 'Single Course pane'
    });
    // Need to make course.html 
    // What is going on here?
    addWindow.loadURL(`file://${__dirname}/course.html`);
    addWindow.on('closed', () => addWindow = null);
}

var createChildWindow = function (mainWindow,url) {
    
    var child= new BrowserWindow({
        parent: mainWindow, 
        modal:true, 
        show:false
    });
    child.loadURL(url);
    return child;

}

var showChildWindow= function(browserWindow){
 
    browserWindow.show();
   // browserWindow.openDevTools();
     // log.info(browserWindow.webContents); 
}

