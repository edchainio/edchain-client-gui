
const {remote} = require('electron');

const {dialog, BrowserWindow} = remote;

var log = require('electron-log')
var path = require('path');         // https://nodejs.org/api/path.html
var url = require('url');           // https://nodejs.org/api/url.html
var ipfsAPI = require('ipfs-api');
const pubsub = remote.require('electron-pubsub');
var fs = require('fs');
var ipcRenderer=require('electron').ipcRenderer;


ipcRenderer.on('ipfsChildLog',(event,data) => {
	log.info('data',data);
	$('#console').text(data);
})


var checkOnline = function(){ 

	pubsub.publish("ipfs:isOnline").then(function(value){

		if(value ==true){
			$("#ipfs-slider").prop("checked",true);
		}
	
	});
}


$(document).ready(function() {


	checkOnline();

	$("#ipfs-slider").click(function(){
		
		if($(this).prop("checked")==true){
			pubsub.publish("ipfs:start");
		}
		else if($(this).prop("checked")==false){
			pubsub.publish("ipfs:stop");
		}
	});

	pubsub.publish("ipfs:getPeerId").then(function(value){

		$("#peerId").text(value);
	
	});
	
	pubsub.publish("ipfs:getIPFSGWAddr").then(function(value){
			
		$("#gateway-addr").val(value);
			
	});


	pubsub.publish("ipfs:getIPFSAPIAddress").then(function(value){
		$("#ipfs-api-addr").val(value);
	});


	pubsub.publish("ipfs:getIPFSDatastorePath").then(function(value){
				
		$("#ipfs-datastore-path").val(value);
		
	});

});

