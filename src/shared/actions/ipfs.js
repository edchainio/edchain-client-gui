// make actionCreators here and define action types
// import the process_ipfs into here?



// action creators
// state should not be kept here
var __log = [];

var logOutput = function (value){
    if(value){
        __log.push(value.toString());
        cb = options.afterLogUpdateHook || function(){};
        cb(__log);
    }
};

// the payloads should be actions that are created
// or not.

var getLog = function(event, ...args){
	event.sender.send("getLog", __log);
};

var getId = function(event, ...args){
	ipfsId(function(payload){
		// maybe should return a function?
		event.sender.send("getId", payload);
	});
}

var isOnline = function(event, ...args){
	isOnline(function(payload){
		// maybe should return a function?
		event.sender.send("isOnline", payload);
	});
};

var getPeerId = function(event, ...args){
	ipfsPeerId(function(payload){
		// maybe should return a function?
		event.sender.send("getPeerId", payload);
	});

};

var getIPFSDatastorePath = function(event, ...args){
	ipfsDatastorePath(function(payload){
		// maybe should return a function?
		event.sender.send("getIPFSDatastorePath", payload);
	});

};

var getIPFSAPIAddress = function(event, ...args){
	ipfsAPIAddress(function(payload){
		// maybe should return a function?
		event.sender.send("getIPFSAPIAddress", payload);
	});

};

var getIPFSGWAddr = function(event, ...args){
	ipfsGatewayAddress(function(payload){
		// maybe should return a function?
		event.sender.send("getIPFSGWAddr", payload);
	});
};

var checkStatus = function(event){
	ipfsStatus(function(payload){
		// maybe should return a function?
		event.sender.send("checkStatus", payload);
	});
	
};

var start = function(event, ...args){
	logOutput('starting..');
	logOutput('Starting IPFS...');
	startIpfs(logOutput);
};

var stop = function(event, ...args){
	logOutput('stopping..');
    ipfsStop(logOutput);
};

var addPin = function(event, hash){
	addPins(function(payload){
		// maybe should return a function?
		event.sender.send("isPinned", hash, payload);
		// why just for this one
	}, `/ipfs/${hash}`);
};

var removePin = function(event, hash){
	removePins(function(payload){
		// maybe should return a function?
		event.sender.send("ipfsRemovePin", hash, payload);
	}, hash);
};

var checkPin = function(event, hash){

	checkPin(function(payload){
		// maybe should return a function?
		event.sender.send("isPinned", hash, payload);
	}, hash);
};


var ipfsSwarmPeers = function(event, ...args){
	ipfsSwarmPeers(function(payload){
		event.sender.send("peerInfos",payload);
	});
};