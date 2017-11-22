
const {remote} = require('electron');

const {dialog, BrowserWindow} = remote;

var log1 = require('electron-log')
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var ipfsAPI = require('ipfs-api');
const pubsub1 = require('electron-pubsub');
var fs = require('fs');
var ipfs = require('../../process_ipfs')();

var getFileData = function(fn){
	fs.readFile('/tmp/log','r',(err,fd) => {
   	if(err){
   		if(err.code === 'ENOENT'){
   			log1.info('file does not exist');
   			return;
   		}
   		throw err;
   	}
   	fn(fd);
});
}

pubsub1.subscribe('uiLogging',(message,value) => {
    		
   getFileData(function(fval){
   	log1.info(fval);
   	$('#console').append(fval);

   });
   
   });

var checkOnline = function(){ 
		
		ipfs.isOnline(function(val){

		if(val ==true){
			$("#ipfs-slider").prop("checked",true);
		}
	});
}



$(document).ready(function() {


	checkOnline();


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

});

