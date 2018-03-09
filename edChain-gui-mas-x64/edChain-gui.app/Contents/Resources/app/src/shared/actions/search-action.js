const { createAliasedAction } = require("electron-redux");
const search = require("../../api/search");


var getElasticSearch = exports.getElasticSearch = createAliasedAction( "getElasticSearch", function () {
	return function(dispatch){

		search.bulk().then(function(data){
			console.log("isElasticSearchOnline",data)
			
		}).catch(function(error){
		
			console.log("isElasticSearchOnline",error);
		
		});
	};
});
