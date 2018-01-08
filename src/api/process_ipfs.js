// this might be considered an api
// import this into the actions file for ipfs


const platform = require('os').platform();

var path = require('path');  
var ipfsAPI = require('ipfs-api');

var log = require('electron-log');

const { spawn, exec } = require('child_process');


var ipfs = null;

// api
var startIpfs = function(callback){
	const ipfsPath = path.resolve(__dirname, '../../bin', platform, 'ipfs');
	ipfsProcess = spawn(ipfsPath, ['daemon', '--init']);
	
	ipfsProcess.stdout.on('data', function(data){
		callback(data.toString());	
	});

	ipfsProcess.stderr.on('data', function(data){;
	 	callback('ipfs error:' + data.toString());
	});

	ipfsProcess.on('exit', function(code){
		callback('ipfs exit:' + code.toString());
	});
};

var ipfsStop = function(callback){

	return exec('pkill ipfs', function (err, stdout, stderr){
		// is this correct?
		process.stdout.on('data', function(data){
			callback('ipfs out:' + data.toString());
		});

		process.stderr.on('data', function(data){
		 	callback('ipfs error:' + data.toString());
		});

		process.on('exit', function(code){
			callback('ipfs exit:' + code.toString());
		});
		ipfs = null
	});
};

var ipfsPeerId = function(fn){
	
	getIPFS().config.get('Identity.PeerID',(err,config) => {
		// log.info("ipfsPeerId =", config);
		if(err){
//			throw err;
		}
		fn(config);
	});
};

var ipfsDatastorePath = function(fn){

	getIPFS().config.get('Datastore.Path',(err,config) => {
		// log.info("var ipfsDatastorePath", config);
		if(err){
	//		throw err;
		}
		fn(config);
	});
};

var ipfsGatewayAddress = function(fn){

	getIPFS().config.get('Addresses.Gateway',(err,config) => {
		// log.info("var ipfsGatewayAddress", config);
		if(err){
	//		throw err;
		}
		fn(config);
		
	});
};

var ipfsAPIAddress = function(fn){

	getIPFS().config.get('Addresses.API',(err, config) => {
		// log.info("var ipfsAPIAddress", config);
		if(err){
			//	throw err;
		}
		fn(config);
	});
};

var ipfsLogTail = function(fn){

	getIPFS().log.tail((err,value) => {
		if(err){
		//	throw err;
		}
	
		fn(value);
	});
};

var ipfsStatus = function(func){
 
    ipfs.version().then((res) => {
		// log.info("ipfsStatus", res);
		func(res);
	}).catch((err) => {
		logger.error(err)
	});
};

var isOnline = function(fn){
	let isUp=false;
    ipfsId(function(value){
	    // log.info("isOnline", value);
	    if(value!=null && value['addresses']){
	            isUp=true;
	     }
	    fn(isUp); 
    });
};

var ipfsId = function(fn){
	var iID;
	
	var funcId = function (err,identity){
		// log.info("ipfsId", identity);
		if(err){
			// log.info(err);
		}
		
		fn(identity);
	};
	// log.info(getIPFS());
	getIPFS().id(funcId);
	
};




var getIPFS = function(){
	if(!ipfs){
		try{
			ipfs = ipfsAPI('localhost','5001',{protocol:'http'});
		}
		catch(e){
			// log.info("cannot connect to ipfs");
		}
	
	}
	return ipfs;
};


var removePins = function(fn, hash){
	
	getIPFS().pin.rm(hash, function (err,pinset) {
		// log.info("removePins", pinset);
		if(err){
			
			log.info(err);
			fn(false);
		
		}else{
			// log.info("removePin",pinset);
			fn(true);
		
		}

	});
	
};

var addPins = function(fn, hash){
	
	getIPFS().pin.add(hash, function (err,pinset) {
		// log.info('addPins', pinset);

		if(err){
			
			// log.info(err);
			fn(false);
		
		}else{
			// log.info("pinned", pinset);
			fn(true);
		
		}
	});
	
};

var checkPin = function(fn, hash){

	getIPFS().pin.ls(hash, function (err, pinset) {
		// log.info("checkPin", pinset);
		if(err){
			pinset="error"
			isPinned = false;
		}
		else{
			isPinned = true;
		}
		fn(isPinned);

	});
};


var ipfsSwarmPeers = function (fn){
	getIPFS().swarm.peers(function(err,peers){
		if(err){
			log.info("ipfsSwarmPeers", err);
		}
		
		fn(peers);
	}); 
};


module.exports = {
	startIpfs,
	ipfsStop,
	ipfsPeerId,
	ipfsDatastorePath,
	ipfsGatewayAddress,
	ipfsAPIAddress,
	ipfsLogTail,
	ipfsStatus,
	isOnline,
	ipfsId,
	removePins,
	addPins,
	checkPin,
	ipfsSwarmPeers
};