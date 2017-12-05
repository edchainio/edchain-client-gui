const platform = require('os').platform();

const exec = require('child_process').exec;
const pubsub = require('electron-pubsub');
var path = require('path');  
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');
const {spawn} = require('child_process');
var fs = require('fs');



var startIpfs = function(){
	const ipfsPath = path.resolve(__dirname, 'bin', platform, 'ipfs');
	const ipfs = spawn(ipfsPath, ['daemon', '--init']);

	ipfs.stdout.on('data', function(data){
		pubsub.publish('ipfs:logging', data.toString()); 			
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
		fn.resolve(config);
	});
}

var ipfsDatastorePath = function(fn){

	getIPFS().config.get('Datastore.Path',(err,config) => {
		if(err){
	//		throw err;
		}
		fn.resolve(config);
	});
}

var ipfsGatewayAddress = function(fn){

	getIPFS().config.get('Addresses.Gateway',(err,config) => {
		if(err){
	//		throw err;
		}
	fn.resolve(config);
		
	});

}



var ipfsAPIAddress = function(fn){

	getIPFS().config.get('Addresses.API',(err,config) => {
		if(err){
		//	throw err;
		}
		fn.resolve(config);
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
 
    ipfs.version()
    	.then((res) => {
    		log.info(res);
    		func(res);
    	})
    	.catch((err) => {
    		logger.error(err)
    	});
};

var isOnline = function(fn){
	let isUp=false;
    ipfsId(function(value){
	    
	    if(value!=null && value['addresses']){
	            isUp=true;
	     }
	    
	     fn.resolve(isUp); 
    
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


var manager = function(){
	var self = {};
	self.ipfs = startIpfs();
	
	self.getId = function(fn){
		ipfsId(fn);
	}
	
	self.isOnline = function(fn){
		isOnline(fn);
	}

	
	self.checkStatus = function(response){
		
		ipfsStatus(function(response2){
			response(response2);
		});
		
	};

	self.start = function(){
		log.info('starting..');
		pubsub.publish('ipfs:logging', {info: 'Starting IPFS...'});
		self.ipfs = startIpfs();

	
	};

	self.stop = function(){
		log.info('stopping..');
	    self.ipfs = ipfsStop();
		
	};

	self.getPeerId = function(fn){
		ipfsPeerId(fn);
	
	}
	self.getIPFSDatastorePath = function(fn){
	
		ipfsDatastorePath(fn);
	
	} 
	self.getIPFSAPIAddress = function(fn){
	
		ipfsAPIAddress(fn);
	
	}
	self.getIPFSGWAddr = function(fn){
	
		ipfsGatewayAddress(fn);
	
	}

	return self;
};


module.exports = manager;
