var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var log = require('electron-log');
const { exec } = require('child_process');
const platform = require('os').platform();
const { ipcMain, app, protocol, BrowserWindow, Menu, Tray } = require('electron');

var __windows = {};

var __logSubscribers = {};

var getIcon = (function(){
    var iconMap = {
        "darwin": ".icns",
        "linux": ".png"
    };
    return function(){
        return `/static/img/icon${iconMap[platform] || ".png"}`;
    };
})();


var ipfs = require('./process_ipfs')({
    "afterLogUpdateHook": function(ipfsLog){
        for(let subscriber in __logSubscribers){
            if(typeof subscriber.send === 'function'){
                subscriber.send('ipfs:logging', ipfsLog);
            }
        }
    }
});

var registerListeners = function(listeners){
    for (let prefix in listeners){
        for(let prop in listeners[prefix]){
            if(typeof listeners[prefix][prop] === 'function'){
                ipcMain.on(prefix + ':' + prop, listeners[prefix][prop]);
            }
        }
    }   
};

registerListeners({ipfs});

var createAddWindow = function () {
    var addWindow = createWindow({
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
        show:false,
        hasIpfsLogging: true
    });
    child.loadURL(url);
    return child;

};

var showChildWindow = function(browserWindow){
 
    browserWindow.show();
   // browserWindow.openDevTools();
     // log.info(browserWindow.webContents); 
};

// Window Factory
var createWindow = function createWindow(config){
    var 
        __id, browserWindow, 
        hasIpfsLogging = false;
    
    if(Object.hasOwnProperty.call(config, "hasIpfsLogging")){
        hasIpfsLogging = config["hasIpfsLogging"];
        config["hasIpfsLogging"] = null;
    }

    browserWindow = new BrowserWindow(config);
    __id = browserWindow.id;
    
    __windows[__id] = browserWindow;
    
    if(hasIpfsLogging){
        __logSubscribers[__id] = browserWindow.webContents;
    }

    browserWindow.on('closed', function(){
        __windows[__id].removeAllListeners();
        
        if(__logSubscribers[__id]) __logSubscribers[__id] = null;

        __windows[__id] = null;
    });
    return browserWindow;
};

var createMainWindow = function createMainWindow(){
    var settingsWindow, mainWindow;

    mainWindow = createWindow({
        width: 960,
        height: 540,
        //frame: false,
        icon: __dirname + getIcon()
    });
    
    //    createChildWindow(mainWindow);
    const tray = new Tray(__dirname + getIcon());

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
        showChildWindow(createChildWindow(mainWindow, url));
    });

    ipcMain.on('createChildWindow', function(event, url){
        settingsWindow = createChildWindow(mainWindow,url);
    });

    ipcMain.on('showChildWindow', function(){
        showChildWindow(settingsWindow);
    });

    ipcMain.on("closePage", function(event, id){
        __windows[id].close();
    });
};

app.on('ready', function(){
    // Custom File Protocol
    // Confirm if this works on windows
    // protocol.interceptFileProtocol(
    //     'file', 
    //     (request, callback) => {
    //         const url = request.url.substr(7);    /* all urls start with 'file://' */
    //         const assetPath = path.normalize(`${__dirname}/${url}`);
    //         callback({ "path": assetPath });
    //     }, (err) => {
    //     if (err) console.error('Failed to register protocol')
    // });

    createMainWindow();

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    ipfs.stop();
});


app.on('activate', (event, hasVisibleWindows) => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!__windows.length) {
        createMainWindow();
    }
});