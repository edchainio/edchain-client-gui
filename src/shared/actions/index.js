var fs = require('fs');
var path = require('path'); 

// importing all files in this directory

var currentFile = path.basename(__filename);

fs.readdirSync(__dirname).forEach(file => {
	if(currentFile !== file && file.endsWith("js")){
		exports[path.basename(file, '.js')] = require(path.resolve(__dirname, file));
	}
});