var fs = require('fs');
var path = require('path'); 


var _exports = {};

fs.readdirSync(__dirname).forEach(file => {
	if(file.endsWith("js")){
		_exports[file.slice(0, -3)] = require(path.resolve(__dirname, file));
	}
});


module.exports = _exports;