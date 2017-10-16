var os = require('os');
var platform = os.platform();

var util = require( 'util' );
var spawn = require( 'child_process' ).spawn;
var mcnode = spawn( 'bin/'+platform+'/mcnode' );
var fs = require( 'fs' );

mcnode.stdout.on( 'data', function( data ){
	console.log( data.toString() );
} );

mcnode.stderr.on( 'data', function( data ){
 	console.log( data.toString() );
} );

mcnode.on( 'exit', function( code ){
	console.error( 'mcnode exit:' + code.toString() );
	process.exit();
} );
