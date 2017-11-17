
const {remote} = require('electron');

const {dialog, BrowserWindow} = remote;

var log1 = require('electron-log')
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var ipfsAPI = require('ipfs-api');

var ipfs = require('../../process_ipfs')();

$(document).ready(function() {
	
$("#ipfs-slider").click(function(){
	
	if($(this).prop("checked")==true){
		ipfs.start();
	}
	else if($(this).prop("checked")==false){
		ipfs.stop();
	}
});


});

