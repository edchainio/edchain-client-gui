const { ipcRenderer, remote } = require('electron');
const configureStore = require('../../shared/store/configureStore');

const currentWindow = remote.getCurrentWindow();

// get the global.state from the main process
const initialState = remote.getGlobal('state');

// create store
const store = configureStore(initialState, 'renderer');

// TODO: This is roughly how all windows should act
// manage the ui and send everything else to the main process
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

	ipcRenderer.on("getPeerId", function(event, value){
		$("#peerId").text(value);
	});
	
	ipcRenderer.on("getIPFSGWAddr", function(event, value){
		$("#gateway-addr").val(value);	
	});


	ipcRenderer.on("ipfsAddPin", function(event, value){
		log.info("addPinVal",value);
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
		if(value === true){
			$("#ipfs-slider").prop("checked", true);
		}
	});
	
	initPage();
});

