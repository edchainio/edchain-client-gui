const { createAliasedAction } = require("electron-redux");
const { addPin, removePin, checkPin } = require("./ipfs");
const courses = require("../../api/courses");

// action creators
// IMPORTANT: Actions must contain only the keys "type","payload","error", and "meta"
// Actions contain other keys will behave abnormally.
// for more details on actions refer to: 
// https://github.com/acdlite/flux-standard-action

var getFeatured = createAliasedAction( "getFeatured", function (){
	return function(dispatch){
		courses.getFeatured().then(function({data}){
			data.courses.forEach(function(course){
				dispatch({
					"type": "addCourse",
					"payload": course
				});
				dispatch(getCourseRoot(course.hash));
			});
		});
	};
});


var getCourseRoot = createAliasedAction( "getCourseRoot", function (hash){
	return function(dispatch){
		courses.getCourseRoot(hash).then(function({data}){
			dispatch({
				"type": "setHash",
				"payload": {
					"id": hash, 
					"key": "courseDirectoryHash",
					"value": data["Links"][0].Hash
				}
			});
			dispatch(getCourseDirectory(hash, data["Links"][0].Hash));
			dispatch(checkPin(hash, data["Links"][0].Hash));
		});
	};
});

var getCourseDirectory = createAliasedAction( "getCourseDirectory", function(id, hash){
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function({data}){
			data.Links.forEach(function(link){
            	if(link.Name !== "contents") return;
	            dispatch({
					"type": "setHash",
					"payload": {
						"id": id, 
						"key": "contentsDirectoryHash",
						"value": link.Hash
					}
				});
            	dispatch(getCourseContentsDirectroy(id, link.Hash, hash));
            });
		});
	};
} );


var getCourseContentsDirectroy = createAliasedAction( "getCourseContentsDirectroy", function(id, hash, courseDirectoryHash){
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function({data}){
			data.Links.forEach(function(link){
            	if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){    
                   	dispatch({
						"type": "setUrl",
						"payload": {
							"id": id, 
							"key": "image",
							"value": courses.buildImageUrl(link.Hash)
						}
					});
                } else if (link.Name.endsWith('index.htm')){
                    dispatch({
						"type": "setUrl",
						"payload" : {
							"id": id, 
							"key": "index",
							"value": courses.buildIndexUrl(courseDirectoryHash)
						}
					});
                }
            });
		});
	};
} );



module.exports = {
	getFeatured,
	getCourseRoot,
	getCourseDirectory,
	getCourseContentsDirectroy
};