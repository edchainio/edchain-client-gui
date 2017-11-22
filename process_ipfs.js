const platform = require('os').platform();
const exec = require('child_process').exec;
const pubsub = require('electron-pubsub');
var path = require('path');  
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');
const {spawn} = require('child_process');
var fs = require('fs');



var startIpfs = function(){
	
	const ipfsPath = path.resolve(__dirname,'./','bin','linux','ipfs daemon');
	
	const ps= spawn('./bin/linux/ipfs',['daemon']);

		ps.stdout.on('data', function(data){
			fs.appendFile("/tmp/log",data,function(err){
				if(err){
					log.info(error);
				}
			});
		 log.info('publish called');		
		 pubsub.publish('uiLogging', {info: data.toString()});
		
		});

		ps.stderr.on('data', function(data){;
		 	log.info('ipfs error:', data.toString());
		});

		ps.on('exit', function(code){
			log.info('ipfs exit:', code.toString());
		});

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
			throw err;
		}
		fn(config);
	});
}

var ipfsDatastorePath = function(fn){

	getIPFS().config.get('Datastore.Path',(err,config) => {
		if(err){
			throw err;
		}
		fn(config);
	});
}

var ipfsGatewayAddress = function(fn){

	getIPFS().config.get('Addresses.Gateway',(err,config) => {
		if(err){
			throw err;
		}
		fn(config);
	});

}
/*
var funcipfsGWAddr = function (){
	return new Promise((resolve,reject) => {

		let value="hello1";

		if(true){
			resolve(value);
		}
		else{
			reject(Error("broken"));
		} 
		});
}

var ipfsGWAddr = new Promise((resolve,reject) => {

		let value="hello1";

		if(true){
			resolve(value);
		}
		else{
			reject(Error("broken"));
		}



	getIPFS().config.get('Addresses.Gateway',(err,config) => {
		if(err){
			throw err;
		}
		console.log(config);
		
	});




});*/


var ipfsAPIAddress = function(fn){

	getIPFS().config.get('Addresses.API',(err,config) => {
		if(err){
			throw err;
		}
		fn(config);
	});

}

var ipfsLogTail = function(fn){

	getIPFS().log.tail((err,value) => {
		if(err){
			throw err;
		}
		log.info(value);
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
    ipfs.getId(function(value){
        if(value['addresses']){
            isUp=true;
        }
       fn(isUp); 
    });
}

var ipfsId = function(fn){
	var iID;
	
	var funcId = function (err,identity){
		if(err){
			throw err;
		}
		
		fn(identity);
	};
	
	getIPFS().id(funcId);
	
}



var getIPFS = function(){
	let ipfs=null;
	if(ipfs === null){
		ipfs= ipfsAPI('localhost','5001',{protocol:'http'});
	}
	return ipfs;

}


var manager = function(){
	var self = {};
	self.ipfs = startIpfs();
	
	self.getId = function(fn){
		ipfsId(function(id){
			fn(id);
		});
	}

	self.isOnline = function(fn){
		isOnline(function(online){
			fn(online);
		});
	}

	
	self.checkStatus = function(response){
		
		ipfsStatus(function(response2){
			response(response2);
		});
		
	};

	self.start = function(){
		log.info('starting..');
		pubsub.publish('uiLogging', {info: 'Starting IPFS...'});
		self.ipfs = startIpfs();

	
	};

	self.stop = function(){
		log.info('stopping..');
	    self.ipfs = ipfsStop();
		
	};

	self.getPeerId = function(fn){
		ipfsPeerId(function(peerId){
			fn(peerId);
		});
	
	}
	self.getIPFSDatastorePath = function(fn){
	
		ipfsDatastorePath(function(path){
			fn(path);
		});
	
	} 
	self.getIPFSAPIAddress = function(fn){
	
		ipfsAPIAddress(function(addr){
			fn(addr);
		});
	
	}
	self.getIPFSGWAddr = function(fn){
	
		ipfsGatewayAddress(function(dAddr){
			fn(dAddr);
		});
	
	}

	return self;
};

module.exports = manager;
