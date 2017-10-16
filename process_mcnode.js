const platform = require('os').platform();
const spawn = require('child_process').spawn;
const pubsub = require('electron-pubsub');

var startMcnode = function(){
	let mcnode = spawn('bin/'+platform+'/mcnode -d /ip4/104.236.125.197/tcp/9000/p2p/QmRXjzUbsTHYa9t4z47B7tR7zsfAKq3iCkvAdN3NKigWPn');

	mcnode.stdout.on('data', function(data){
		console.log('mcnode out:', data.toString());
	});

	mcnode.stderr.on('data', function(data){
	 	console.error('mcnode error:', data.toString());
	});

	mcnode.on('exit', function(code){
		console.error('mcnode exit:', code.toString());
	});

	return mcnode;
};

var manager = function(){

	this.mcnode = startMcnode();

	this.start = function(){
		if(this.mcnode.killed){
			this.mcnode = startMcnode();
		}
	};

	this.stop = function(){
		if(!this.mcnode.killed){
			this.mcnode.kill();
		}
	};

	return this;
};

module.exports = manager;
