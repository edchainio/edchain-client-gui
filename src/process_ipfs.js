const platform = require('os').platform();

var path = require('path');  
var ipfsAPI = require('ipfs-api');

var log = require('electron-log');

const { spawn, exec } = require('child_process');


var startIpfs = function(callback){
	const ipfsPath = path.resolve(__dirname, '../bin', platform, 'ipfs');
	const ipfs = spawn(ipfsPath, ['daemon', '--init']);

	ipfs.stdout.on('data', function(data){
		callback(data.toString());	
	});

	ipfs.stderr.on('data', function(data){;
	 	log.info('ipfs error:', data.toString());
	});

	ipfs.on('exit', function(code){
		log.info('ipfs exit:', code.toString());
	});

	return ipfs;
};

var ipfsStop = function(){

	return exec('pkill ipfs', function (err,stdout,stderr){
		
		process.stdout.on('data', function(data){
			log.info('ipfs out:', data.toString());
		});

		process.stderr.on('data', function(data){
		 	log.info('ipfs error:', data.toString());
		});

		process.on('exit', function(code){
			log.info('ipfs exit:', code.toString());
		});

	});
}

var ipfsPeerId = function(fn){
	
	getIPFS().config.get('Identity.PeerID',(err,config) => {
		if(err){
//			throw err;
		}
		fn(config);
	});
}

var ipfsDatastorePath = function(fn){

	getIPFS().config.get('Datastore.Path',(err,config) => {
		if(err){
	//		throw err;
		}
		fn(config);
	});
}

var ipfsGatewayAddress = function(fn){

	getIPFS().config.get('Addresses.Gateway',(err,config) => {
		if(err){
	//		throw err;
		}
		fn(config);
		
	});

}



var ipfsAPIAddress = function(fn){

	getIPFS().config.get('Addresses.API',(err,config) => {
		if(err){
		//	throw err;
		}
		fn(config);
	});

}

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
		// log.info(res);
		func(res);
	}).catch((err) => {
		logger.error(err)
	});
};

var isOnline = function(fn){
	let isUp=false;
    ipfsId(function(value){
	    
	    if(value!=null && value['addresses']){
	            isUp=true;
	     }
	    fn(isUp); 
    
    });
}

var ipfsId = function(fn){
	var iID;
	
	var funcId = function (err,identity){
		if(err){
			log.info(err);
		}
		
		fn(identity);
	};
	
	getIPFS().id(funcId);
	
}



var getIPFS = function(){
	let ipfs=null;
	if(ipfs === null){
		try{
			ipfs= ipfsAPI('localhost','5001',{protocol:'http'});
		}
		catch(e){
			log.info("cannot connect to ipfs");
		}
	
	}
	return ipfs;

}

var manager = function(options){
	var self = {};

	var __log = [];

	var logOutput = function (value){
        if(value){
            __log.push(value.toString());
            cb = options.afterLogUpdateHook || function(){};
            cb(__log);
        }
    };

    self.getLog = function(event, ...args){
    	event.sender.send("getLog", __log);
    };
	
	self.getId = function(event, ...args){
		ipfsId(function(payload){
			event.sender.send("getId", payload);
		});
	}
	
	self.isOnline = function(event, ...args){
		isOnline(function(payload){
			event.sender.send("isOnline", payload);
		});
	}

	self.getPeerId = function(event, ...args){
		ipfsPeerId(function(payload){
			event.sender.send("getPeerId", payload);
		});
	
	};

	self.getIPFSDatastorePath = function(event, ...args){
		ipfsDatastorePath(function(payload){
			event.sender.send("getIPFSDatastorePath", payload);
		});
	
	};

	self.getIPFSAPIAddress = function(event, ...args){
		ipfsAPIAddress(function(payload){
			event.sender.send("getIPFSAPIAddress", payload);
		});
	
	};

	self.getIPFSGWAddr = function(event, ...args){
		ipfsGatewayAddress(function(payload){
			event.sender.send("getIPFSGWAddr", payload);
		});
	};
	
	self.checkStatus = function(response){
		// TODO: Figure out why this is different
		ipfsStatus(function(response2){
			response(response2);
		});
		
	};

	self.start = function(event, ...args){
		log.info('starting..');
		logOutput('Starting IPFS...');
		self.ipfs = startIpfs(logOutput);
	};

	self.stop = function(event, ...args){
		log.info('stopping..');
	    self.ipfs = ipfsStop();
	};

	self.ipfs = self.start();

	return self;
};


module.exports = manager;
