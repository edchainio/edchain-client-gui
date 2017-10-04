const platform = require('os').platform();
const spawn = require('child_process').spawn;
const pubsub = require('electron-pubsub');

var startIpfs = function(){
	let ipfs = spawn('bin/'+platform+'/ipfs daemon');
	
	ipfs.stdout.on('data', function(data){
		console.log('ipfs out:', data.toString());
	});

	ipfs.stderr.on('data', function(data){
	 	console.error('ipfs error:', data.toString());
	});

	ipfs.on('exit', function(code){
		console.error('ipfs exit:', code.toString());
	});

	return ipfs;
};

var manager = function(){

	this.ipfs = startIpfs();

	this.start = function(){
		if(this.ipfs.killed){
			this.ipfs = startIpfs();
		}
	};

	this.stop = function(){
		if(!this.ipfs.killed){
			this.ipfs.kill();
		}
	};

	return this;
};

module.exports = manager;
