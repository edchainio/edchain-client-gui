const platform = require('os').platform();
const exec = require('child_process').exec;
const pubsub = require('electron-pubsub');
var path = require('path');  
var ipfsAPI = require('ipfs-api');
var log = require('electron-log');


var startIpfs = function(){

	const ipfsPath = path.resolve(__dirname,'./','bin','linux','ipfs daemon');

	return exec(ipfsPath, function (err,stdout,stderr){
	
	log.info("ipfs start exec started");	
	
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

	this.ipfs = startIpfs();

	
	this.checkStatus = function(response){
		
		ipfsStatus(function(response2){
			response(response2);
		});
		
	};

	this.start = function(){
	
		this.ipfs = startIpfs();
	
	};

	this.stop = function(){
		
			log.info("ipfs stop exec started");
			this.ipfs.kill();
		
	};

	return this;
};

module.exports = manager;
