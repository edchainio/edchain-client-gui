"use strict";

var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html

const configureStore = require('./shared/store/configureStore');
const log = require('electron-log');
const platform = require('os').platform();

const { 
    ipcMain, app, protocol 
} = require('electron');

const { registry } = require('electron-redux');

const pages = require('./pages.js');

const { ipfsStop, isOnline } = require("./api/process_ipfs");

const actions = require("./shared/actions");

// we have to do this to ease remote-loading of the initial state :(
global.state = {};

var start = function start(){
    const store = configureStore(global.state, 'main');

    store.subscribe(() => {
        // updates global state to current state
        global.state = store.getState();
    });

    store.dispatch(actions.ipfs.start());

    var throttle = function(callback, wait){
        callback();
        setTimeout(throttle, wait, callback, wait);
    };

    // this should probably be an action itself 
    var syncIpfs = function(){
        store.dispatch(actions.ipfs.syncIpfs());
    };
    
    throttle(function(){
        if (!store.getState().ipfs.isOnline){
            store.dispatch(actions.ipfs.isOnline());
        } else {
            if (!Object.keys(store.getState().courses.items).length){
                store.dispatch(actions.courses.getFeaturedData()); 
            }
            syncIpfs();
        }
    }, 2000);




    // macOS
    // https://electronjs.org/docs/api/app#appdockseticonimage-macos
    if (platform === "darwin"){
        // Seems to hate my .icns
        app.dock.setIcon(path.resolve(__dirname, "public/img/icon.png"));
    }

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('quit', () => {
        // make this a dispatch?
        ipfsStop();
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

    pages.createMainWindow();
};

app.on('ready', function(){
    
    start();

});