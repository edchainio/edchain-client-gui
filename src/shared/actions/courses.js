// make actionCreators here and define action types
const { createAliasedAction } = require("electron-redux");
const { addPin, removePin, checkPin } = require("./ipfs");
const courses = require("../../api/courses");


// action creators
// TODO: More actions to update status
// TODO: Update code to create actions instead of mutating the course

var getFeatured = createAliasedAction( "getFeatured", function (){
	return function(dispatch){
		courses.getFeatured().then(function(data){
			dispatch({
				"type": "addCourse",
				"course": course
			});
			dispatch(getCourseRoot(course.hash));
		});
	};
});


var getCourseRoot = createAliasedAction( "getCourseRoot", function (hash){
	return function(dispatch){
		courses.getCourseRoot(hash).then(function(data){
			dispatch({
				"type": "setHash",
				"id": hash, 
				"key": "courseDirectoryHash",
				"value": data["Links"][0].Hash
			});
			dispatch(getCourseDirectory(data["Links"][0].Hash))
		});
	};
});

var getCourseDirectory = createAliasedAction( "getCourseDirectory", function(hash){
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function(directory){
			directory.Links.forEach(function(link){
            	if(link.Name !== "contents") return;
	            dispatch({
					"type": "setHash",
					"id": hash, 
					"key": "contentsDirectoryHash",
					"value": link.Hash
				});
            	dispatch(getCourseContentsDirectroy(link.Hash, hash));
            });
		});
	};
} );


var getCourseContentsDirectroy = createAliasedAction( "getCourseContentsDirectroy", function(hash, courseDirectoryHash){
	return function(dispatch){
		courses.getCourseContentsDirectroy(hash).then(function(contents){
			contents.Links.forEach(function(link){
            	if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){    
                   	dispatch({
						"type": "setUrl",
						"id": hash, 
						"key": "image",
						"value": courses.buildImageUrl(link.Hash)
					});
                } else if (link.Name.endsWith('index.htm')){
                    dispatch({
						"type": "setUrl",
						"id": hash, 
						"key": "index",
						"value": courses.buildIndexUrl(courseDirectoryHash)
					});
                }
            });
		});
	};
} );