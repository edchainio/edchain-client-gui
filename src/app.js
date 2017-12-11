var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html

const configureStore = require('./shared/store/configureStore');

const platform = require('os').platform();

const { 
    ipcMain, app, protocol 
} = require('electron');


const pages = require('./pages.js');


// we have to do this to ease remote-loading of the initial state :(
global.state = {};

// macOS
// https://electronjs.org/docs/api/app#appdockseticonimage-macos
if (platform === "darwin"){
    // Seems to hate my .icns
    app.dock.setIcon(path.resolve(__dirname, "public/img/icon.png"));
}

app.on('ready', function(){
    const store = configureStore(global.state, 'main');
    // pass the store to ipfs here?
    // example does tasks(store) <<< passes the store to the different tasks
    // tasks uses the store to dispatch different actions.
    // basically different jobs you have to do.
    // ipfs is one of these

    // this is actually to ping the different windows
    // sucks but thats how you do it.
    // this is probably how all windows should be connected to 
    // the main process.
    var ipfs = require('./api/process_ipfs')({
        "afterLogUpdateHook": function(ipfsLog){
            for(let subscriber in pages.getLogSubscribers()){
                if(typeof subscriber.send === 'function'){
                    subscriber.send('ipfs:logging', ipfsLog);
                }
            }
        }
    });

    // TODO: MOVE
    // mounting process
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

    pages.createMainWindow();

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
    // move
    if (!pages.hasWindows()) {
        pages.createMainWindow();
    } else if (hasVisibleWindows) {
        event.preventDefault();
    }
});