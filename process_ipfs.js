const platform = require('os').platform();
const exec = require('child_process').exec;
const pubsub = require('electron-pubsub');
var path = require('path');  
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');

const testscript = exec('sh')


var startIpfs = function(){

	const ipfsPath = path.resolve(__dirname,'./','bin','linux','ipfs daemon');

	return exec(ipfsPath, function (err,stdout,stderr){
	
		log.info("ipfs start exec");	
		
		process.stdout.on('data', function(data){
			console.log('ipfs out:', data.toString());
		});

		process.stderr.on('data', function(data){
		 	console.error('ipfs error:', data.toString());
		});

		process.on('exit', function(code){
			console.error('ipfs exit:', code.toString());
		});

	});
	
};

var ipfsStop = function(){
	const ipfsPath = path.resolve(__dirname,'./','bin','linux','killall -9 ipfs');

	return exec(ipfsPath, function (err,stdout,stderr){
	
		log.info("ipfs stop exec started");	
		
		process.stdout.on('data', function(data){
			console.log('ipfs out:', data.toString());
		});

		process.stderr.on('data', function(data){
		 	console.error('ipfs error:', data.toString());
		});

		process.on('exit', function(code){
			console.error('ipfs exit:', code.toString());
		});

	});
}


var ipfsStatus = function(func){
   
    var ipfs = ipfsAPI('localhost','5001',{protocol:'http'});

    ipfs.version()
    	.then((res) => {
    		log.info(res);
    		func(res);
    	})
    	.catch((err) => {
    		logger.error(err)
    	});
};


var manager = function(){
	var self = {};
	self.ipfs = startIpfs();

	
	self.checkStatus = function(response){
		
		ipfsStatus(function(response2){
			response(response2);
		});
		
	};

	self.start = function(){
	
		self.ipfs = startIpfs();
	
	};

	self.stop = function(){
		
	    self.ipfs = ipfsStop();
		
	};

	return self;
};

module.exports = manager;
