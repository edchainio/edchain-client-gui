const { ipcRenderer, remote } = require('electron');
const configureStore = require('../../shared/store/configureStore');

const currentWindow = remote.getCurrentWindow();

const ipfsActions = require("../../shared/actions/ipfs");

// get the global.state from the main process
const initialState = remote.getGlobal('state');

// create store
const store = configureStore(initialState, 'renderer');

ipcRenderer.on('redux-action', (event, payload) => {
	store.dispatch(payload);
});

// TODO: This is roughly how all windows should act
// manage the ui and send everything else to the main process
var checkOnline = function(){
	store.dispatch(ipfsActions.isOnline());
};

var applyState = function(ipfs){
	$("#peerId").text(ipfs.peerId);
	$("#gateway-addr").val(ipfs.gatewayAddress);
	$("#ipfs-api-addr").val(ipfs.apiAddress);
	$("#ipfs-datastore-path").val(ipfs.dataStorePath);
	
	$("#ipfs-slider").prop("checked", ipfs.isOnline);
	var $outputElement = $('#console');
	var output = "<p><code>" + ipfs.logs.join("</code></p><p><code>") + "</code></p>";
	$outputElement.html(output);
};

$(document).ready(function() {

	$("#ipfs-slider").on("click",function(){

		if($(this).prop("checked")==true){
			store.dispatch(ipfsActions.start());
		}
		else if($(this).prop("checked")==false){
			store.dispatch(ipfsActions.stop());
		}
	});

	store.subscribe(function(){
		// executed when something could have changed the state
		applyState(store.getState().ipfs);
	});

	applyState(store.getState().ipfs);
});

