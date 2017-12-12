// make actionCreators here and define action types
const { createAliasedAction } = require("electron-redux");
const ipfs = require("../../api/process_ipfs");

// action creators

var logOutput = createAliasedAction( "logOutput", function (value){
	return function(dispatch){
	    if(value){
	        dispatch({ "type" : "logOutput", "payload" : value.toString() });
	    }
	};
});

var getId = createAliasedAction( "getId", function(){
	return function(dispatch){
		ipfs.ipfsId(function(payload){
			dispatch({ "type" : "getId", "payload" : payload });
		});
	};
});

var isOnline = createAliasedAction( "isOnline", function(){
	return function(dispatch){
		ipfs.isOnline(function(payload){
			dispatch({ "type" : "isOnline", "payload" : payload });
		});
	};
});

var getPeerId = createAliasedAction( "getPeerId", function(){
	return function(dispatch){
		ipfs.ipfsPeerId(function(payload){
			dispatch({ "type" : "getPeerId", "payload" : payload });
		});
	};
});

var getIPFSDatastorePath = createAliasedAction( "getIPFSDatastorePath", function(){
	return function(dispatch){
		ipfs.ipfsDatastorePath(function(payload){
			dispatch({ "type" : "getIPFSDatastorePath", "payload" : payload });
		});
	};
});

var getIPFSAPIAddress = createAliasedAction( "getIPFSAPIAddress", function(){
	return function(dispatch){
		ipfs.ipfsAPIAddress(function(payload){
			dispatch({ "type" : "getIPFSAPIAddress", "payload" : payload });
		});
	};
});

var getIPFSGWAddr = createAliasedAction( "getIPFSGWAddr", function(){
	return function(dispatch){
		ipfs.ipfsGatewayAddress(function(payload){
			dispatch({ "type" : "getIPFSGWAddr", "payload" : payload });
		});
	};
});

var checkStatus = createAliasedAction( "checkStatus", function(){
	return function(dispatch){
		ipfs.ipfsStatus(function(payload){
			dispatch({ "type" : "checkStatus", "payload" : payload });
		});
	};
});

var start = createAliasedAction( "start", function(){
	return function(dispatch){
		dispatch(logOutput('starting..'));
		dispatch(logOutput('Starting IPFS...'));
		ipfs.startIpfs((message)=> dispatch(logOutput(message)));
	};
});

var stop = createAliasedAction( "stop", function(){
	return function(dispatch){
		dispatch(logOutput('stopping..'));
	    ipfs.ipfsStop((message)=> dispatch(logOutput(message)));
	};
});

var addPin = createAliasedAction( "addPin", function(hash){
	return function(dispatch){
		ipfs.addPins(function(payload){
			dispatch({ "type" : "isPinned", "hash": hash, "payload": payload});
			// why just for this one
		}, `/ipfs/${hash}`);
	};
});

var removePin = createAliasedAction( "removePin", function(hash){
	return function(dispatch){
		ipfs.removePins(function(payload){
			dispatch({ "type" : "ipfsRemovePin", "hash": hash, "payload": payload});
		}, hash);
	};
});

var checkPin = createAliasedAction( "checkPin", function(hash){
	return function(dispatch){
		ipfs.checkPin(function(payload){
			dispatch({ "type" : "isPinned", "hash": hash, "payload": payload});
		}, hash);
	};
});


var ipfsSwarmPeers = createAliasedAction( "ipfsSwarmPeers", function(){
	return function(dispatch){
		ipfs.ipfsSwarmPeers(function(payload){
			dispatch({ "type" : "peerInfos", "payload" : payload });
		});
	};
});



module.exports = {
	logOutput,
	getId,
	isOnline,
	getPeerId,
	getIPFSDatastorePath,
	getIPFSAPIAddress,
	getIPFSGWAddr,
	checkStatus,
	start,
	stop,
	addPin,
	removePin,
	checkPin,
	ipfsSwarmPeers
};

