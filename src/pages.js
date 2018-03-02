const path = require('path');         // https://nodejs.org/api/path.html
const log = require('electron-log');

const platform = require('os').platform();


const {
    ipcMain, BrowserWindow, Tray 
} = require('electron');

var __windows = {};
var __logSubscribers = {};


var getIcon = (function(){
    var iconMap = {
        "darwin": "/public/img/icon.icns",
        "linux": "/public/img/icon.png"
    };

    return function(){
        return iconMap[platform] || "/public/img/icon.png";
    };
})();


var getTray = (function(){
    var 
        tray = null, 
        imageFolder = path.resolve(__dirname, "public/img/");

    return function(__window){

        if(!tray){
            // http://electron.rocks/proper-tray-icon/
            if (platform === 'darwin' || platform === 'linux') {  
                trayImage = path.resolve(imageFolder, 'icon.png');
            }
            else if (platform === 'win32') {  
                trayImage = path.resolve(imageFolder, 'icon.ico');
            }
            tray = new Tray(path.resolve(__dirname, trayImage));
            if (platform === "darwin") {  
                tray.setPressedImage(path.resolve(imageFolder, 'icon.png'));
            }
        }

        tray.on('click', () => {
            __window.isVisible() ? __window.hide() : __window.show();
        });

        __window.on('show', () => {
            tray.setHighlightMode('always');
        });

        __window.on('hide', () => {
            tray.setHighlightMode('never');
        });
        return tray;
    };
})();

var createChildWindow = function (mainWindow, url) {
    
    var child = createWindow({
        parent: mainWindow, 
        modal:true, 
        show:true,
        hasIpfsLogging: true,       
        center: true,
        width: 1100,
        height: 700

    });

    if (process.platform === 'darwin') {
        child.webContents.once("did-navigate", function(event, ...args){
            child.webContents.once("dom-ready", function(event, ...args){
                // TODO: THIS IS GOING TO NEED TO BE MORE EXTENSIVE
                // need to wrap more than just close. also need to inercept events
                var defaultNav = `
                    <nav>
                        <button type="button" class="close" id="close-window" aria-label="Close">
                            <span aria-hidden="true">&times;</span> Close
                        </button>
                    </nav>
                `;

                var pageModification = `(function(){
                    var $nav = $(\`${defaultNav}\`).prependTo('body');
                    $nav.on("click", "#close-window", function(event){
                        event.preventDefault();
                        window.close();
                    });
                })();`;
                event.sender.executeJavaScript(pageModification, null);
            });
        });
    }
    child.loadURL(url);
    return child;

};



var showChildWindow = function(browserWindow){
    browserWindow.show();
  
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
   
    if (process.env.ENV=='dev') {
    
        browserWindow.openDevTools();
   
    }
//     browserWindow.openDevTools();
    return browserWindow;
};


var createMainWindow = function createMainWindow(){
    var
        settingsWindow, mainWindow;

    mainWindow = createWindow({
        width: 1147,
        height: 849,
        center: true,
        //frame: false,
        icon: path.resolve(__dirname, "public/img/icon.png")
    });

    mainWindow.tray = getTray(mainWindow);

    mainWindow.loadURL(`file://${__dirname}/public/html/index.html`);
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
   
    ipcMain.on('createAndShowChildWindow', function(event,url){
        showChildWindow(createChildWindow(mainWindow, url));
    });

    ipcMain.on('openSettings', function(event){
        settingsWindow = createChildWindow(
            mainWindow,
            //'file://' + __dirname + '/public/html/settings.html'
            'file://' + __dirname + '/public/html/settings-newlook.html'
        );
        showChildWindow(settingsWindow);
    });

    ipcMain.on('openStellar', function(event){
        settingsWindow = createChildWindow(
            mainWindow, `file://${__dirname}/steller-term/wallet.html`);
           // 'file://' + __dirname + '/public/html/settings.html'
        
        showChildWindow(settingsWindow);
    });


    ipcMain.on("closePage", function(event, id){
        __windows[id].close();
    });
};


var getLogSubscribers = function getLogSubscribers(){
    return __logSubscribers;
};

var hasWindows = function hasWindows(){
    return !!Object.keys(__windows).length;
};

module.exports = {
    createMainWindow,
    getLogSubscribers,
    hasWindows
};