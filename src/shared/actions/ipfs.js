// make actionCreators here and define action types
const { createAliasedAction } = require("electron-redux");
const ipfs = require("../../api/process_ipfs");



const log = require('electron-log');
// action creators

var logOutput = exports.logOutput = createAliasedAction( "logOutput", function (value){
	return function(dispatch){
	    if(value){
	        dispatch({ "type" : "logOutput", "payload" : value.toString() });
	    }
	};
});

var getId = exports.getId = createAliasedAction( "getId", function(){
	return function(dispatch){
		ipfs.ipfsId(function(payload){
			dispatch({ "type" : "getId", "payload" : payload });
		});
	};
});

var isOnline = exports.isOnline = createAliasedAction( "isOnline", function(){
	return function(dispatch){
		ipfs.isOnline(function(payload){
			dispatch({ "type" : "isOnline", "payload" : payload });
		});
	};
});

var getPeerId = exports.getPeerId = createAliasedAction( "getPeerId", function(){
	return function(dispatch){
		ipfs.ipfsPeerId(function(payload){
			dispatch({ "type" : "getPeerId", "payload" : payload });
		});
	};
});

var getIPFSDatastorePath = exports.getIPFSDatastorePath = createAliasedAction( "getIPFSDatastorePath", function(){
	return function(dispatch){
		ipfs.ipfsDatastorePath(function(payload){
			dispatch({ "type" : "getIPFSDatastorePath", "payload" : payload });
		});
	};
});

var getIPFSAPIAddress = exports.getIPFSAPIAddress = createAliasedAction( "getIPFSAPIAddress", function(){
	return function(dispatch){
		ipfs.ipfsAPIAddress(function(payload){
			dispatch({ "type" : "getIPFSAPIAddress", "payload" : payload });
		});
	};
});

var getIPFSGWAddr = exports.getIPFSGWAddr = createAliasedAction( "getIPFSGWAddr", function(){
	return function(dispatch){
		ipfs.ipfsGatewayAddress(function(payload){
			dispatch({ "type" : "getIPFSGWAddr", "payload" : payload });
		});
	};
});

var checkStatus = exports.checkStatus = createAliasedAction( "checkStatus", function(){
	return function(dispatch){
		ipfs.ipfsStatus(function(payload){
			dispatch({ "type" : "checkStatus", "payload" : payload });
		});
	};
});

var start = exports.start = createAliasedAction( "start", function(){
	return function(dispatch){
		dispatch(logOutput('starting..'));
		dispatch(logOutput('Starting IPFS...'));
		ipfs.startIpfs((message)=> dispatch(logOutput(message)));
	};
});

var stop = exports.stop = createAliasedAction( "stop", function(){
	return function(dispatch){
		dispatch(logOutput('stopping..'));
	    ipfs.ipfsStop((message)=> dispatch(logOutput(message)));
	};
});

var addPin = exports.addPin = createAliasedAction( "addPin", function(id, hash){
	return function(dispatch){
		ipfs.addPins(function(payload){
			dispatch(checkPin(id, hash));
			// why just for this one
		}, `/ipfs/${hash}`);
	};
});

var removePin = exports.removePin = createAliasedAction( "removePin", function(id, hash){
	return function(dispatch){
		ipfs.removePins(function(payload){
			dispatch(checkPin(id, hash));
		}, hash);
	};
});

var checkPin = exports.checkPin = createAliasedAction( "checkPin", function(id, hash){
	return function(dispatch){
		ipfs.checkPin(function(payload){
			dispatch({ 
				"type" : "setIsPinned", 
				"payload" : {
					"id": id, 
					"value": payload
				}
			});
		}, hash);
	};
});


var ipfsPeerCount = exports.ipfsPeerCount = createAliasedAction( "ipfsPeerCount", function(){
	return function(dispatch){
		ipfs.ipfsSwarmPeers(function(payload){
			dispatch({ "type" : "ipfsPeerCount", "payload" : payload.length });
		});
	};
});

var syncIpfs = exports.syncIpfs = createAliasedAction( "syncIpfs", function(){
	return function(dispatch){
		dispatch(isOnline());
        dispatch(getPeerId());
        dispatch(getIPFSGWAddr());
        dispatch(getIPFSAPIAddress());
        dispatch(getIPFSDatastorePath());
        dispatch(ipfsPeerCount());
	};
});