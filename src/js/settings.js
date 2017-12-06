const { ipcRenderer } = require('electron');


var checkOnline = function(){ 
	ipcRenderer.send("ipfs:isOnline");
};

var initPage = function(){
	ipcRenderer.send("ipfs:getPeerId");
	ipcRenderer.send("ipfs:getIPFSGWAddr");
	ipcRenderer.send("ipfs:getIPFSAPIAddress");
	ipcRenderer.send("ipfs:getIPFSDatastorePath");
	ipcRenderer.send("ipfs:getLog");
	ipcRenderer.send("ipfs:isOnline");
};

$(document).ready(function() {

	$("#ipfs-slider").on("click",function(){
		
		if($(this).prop("checked")==true){
			ipcRenderer.send("ipfs:start");
		}
		else if($(this).prop("checked")==false){
			ipcRenderer.send("ipfs:stop");
		}
	});

	$("#close-window").on("click", function(event){
		event.preventDefault();
		window.close();
	});

	ipcRenderer.on("getPeerId", function(event, value){
		$("#peerId").text(value);
	});
	
	ipcRenderer.on("getIPFSGWAddr", function(event, value){
		$("#gateway-addr").val(value);	
	});


	ipcRenderer.on("getIPFSAPIAddress", function(event, value){
		$("#ipfs-api-addr").val(value);
	});

	ipcRenderer.on("getIPFSDatastorePath", function(event, value){
		$("#ipfs-datastore-path").val(value);	
	});

	ipcRenderer.on('ipfs:logging', function(event, data){
	    var $outputElement = $('#console');
	    var output = "<p><code>" + data.join("</code></p><p><code>") + "</code></p>";
	    $outputElement.html(output);
	});
	
	ipcRenderer.once('getLog', function(event, data){
	    var $outputElement = $('#console');
	    var output = "<p><code>" + data.join("</code></p><p><code>") + "</code></p>";
	    $outputElement.html(output);
	});
	
	ipcRenderer.on("isOnline", function(event, value){
		// Is non strict comparison the intent here?
		if(value == true){
			$("#ipfs-slider").prop("checked",true);
		}
	});
	
	initPage();
});

