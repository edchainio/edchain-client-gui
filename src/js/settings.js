
const {remote} = require('electron');

const {dialog, BrowserWindow} = remote;

var log1 = require('electron-log')
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var ipfsAPI = require('ipfs-api');
const pubsub1 = require('electron-pubsub');

var ipfs = require('../../process_ipfs')();


pubsub1.subscribe('uiLogging',(message,value) => {
  
   $('#console').append(value.info + "<br>");
 
});


$(document).ready(function() {

	
$("#ipfs-slider").click(function(){
	
	if($(this).prop("checked")==true){
		ipfs.start();
	}
	else if($(this).prop("checked")==false){
		ipfs.stop();
	}
});

ipfs.getPeerId(function(val){
	log1.info(val);
	$("#peerId").text(val);
	
});


ipfs.getIPFSGWAddr(function(val){
	
	$("#gateway-addr").val(val);
	
});

ipfs.getIPFSGWAddr(function(val){
	
	$("#gateway-addr").val(val);
	
});

ipfs.getIPFSAPIAddress(function(val){
	
	$("#ipfs-api-addr").val(val);
	
});


ipfs.getIPFSDatastorePath(function(val){
	
	$("#ipfs-datastore-path").val(val);
	
});





/*
ipfsGWAddr(resolve).then(function(result){
	log1.info("yoyoyo");
	log1.info(resolve);
}, function(err){
	log1.info(error);
})*/



});

