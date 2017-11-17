const platform = require('os').platform();
const exec = require('child_process').exec;
const pubsub = require('electron-pubsub');
var path = require('path');  
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');

var startIpfs = function(){
	
	const ipfsPath = path.resolve(__dirname,'./','bin','linux','ipfs daemon');
	
	return exec(ipfsPath, function (err,stdout,stderr){
	
		pubsub.publish('uiLogging', {info: stdout});

		process.stdout.on('data', function(data){
			log.info('ipfs out:', data.toString());

		});

		process.stderr.on('data', function(data){;
		 	log.info('ipfs error:', data.toString());
		});

		process.on('exit', function(code){
			log.info('ipfs exit:', code.toString());
		});
	
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

var ipfsId = function(fn){
	var iID;
	var ipfs = ipfsAPI('localhost','5001',{protocol:'http'});
	var funcId = function (err,identity){
		if(err){
			throw err;
		}
		
		fn(identity);
	};
	
	ipfs.id(funcId);
	
}





var manager = function(){
	var self = {};
	self.ipfs = startIpfs();
	

	self.getId = function(fn){
		ipfsId(function(id){
			fn(id);
		});
	}

	
	self.checkStatus = function(response){
		
		ipfsStatus(function(response2){
			response(response2);
		});
		
	};

	self.start = function(){
		pubsub.publish('uiLogging', {info: 'Starting IPFS...'});
		self.ipfs = startIpfs();
	
	};

	self.stop = function(){
		
	    self.ipfs = ipfsStop();
		
	};

	return self;
};

module.exports = manager;
