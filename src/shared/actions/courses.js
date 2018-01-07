const { createAliasedAction } = require("electron-redux");
const { addPin, removePin, checkPin } = require("./ipfs");
const courses = require("../../api/courses");

// action creators
// IMPORTANT: Actions must contain only the keys "type","payload","error", and "meta"
// Actions contain other keys will behave abnormally.
// for more details on actions refer to: 
// https://github.com/acdlite/flux-standard-action


var getSearchData = exports.getSearchData = createAliasedAction( "getSearchData", function (){
	return function(dispatch){
		courses.getSearchData().then(function({data}){
			console.log("getsearchdata",data);
			data.forEach(function(course){
				dispatch({
					"type": "addCourse2",
					"payload": course
				});
				console.log("beforeCourseRoot",course);

				dispatch(getCourseRoot(course.content_address));
			});
		});
	};
});

var getFeatured = exports.getFeatured = createAliasedAction( "getFeatured", function (){
	return function(dispatch){
		courses.getFeatured().then(function({data}){
		//	console.log("featured",data);
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


var getCourseRoot = exports.getCourseRoot = createAliasedAction( "getCourseRoot", function (hash){
	return function(dispatch){
		console.log("hash",hash);
		courses.getCourseRoot(hash).then(function({data}){
			console.log("getcourseroot",data);
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

var getCourseDirectory = exports.getCourseDirectory = createAliasedAction( "getCourseDirectory", function(id, hash){
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function({data}){
			console.log("getcoursedir",data);
			data.Links.forEach(function(link){
			console.log("loink",link);
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


var getCourseContentsDirectroy = exports.getCourseContentsDirectroy = createAliasedAction( "getCourseContentsDirectroy", function(id, hash, courseDirectoryHash){
	console.log("_____________________",id,hash,courseDirectoryHash);
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function({data}){
			console.log("ccc",data);
			data.Links.forEach(function(link){
				console.log("links",link);
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