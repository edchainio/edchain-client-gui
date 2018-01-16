const { createAliasedAction } = require("electron-redux");
const { addPin, removePin, checkPin } = require("./ipfs");
const courses = require("../../api/courses");

// action creators
// IMPORTANT: Actions must contain only the keys "type","payload","error", and "meta"
// Actions contain other keys will behave abnormally.
// for more details on actions refer to: 
// https://github.com/acdlite/flux-standard-action

var addCourse2 = function(data,dispatch){

		data.forEach(function(course){
			dispatch({
				"type": "addCourse2",
				"payload": course
			});

			console.log("beforeCourseRoot",course);
		});
}


var getSearchData = exports.getSearchData = createAliasedAction( "getSearchData", function (){
	return function(dispatch){

		courses.getSearchData(34).then(function({data}){
			let count =0;		
			setResultCount(dispatch,data);
			createPageMap(dispatch,data);
			data.forEach(function(course){
				course.paginationId = count+1;
				count++;
				
				dispatch({
					"type": "addCourse2",
					"payload": course
				});
	//			console.log("beforeCourseRoot",course);

		//		dispatch(getCourseRoot(course.content_address));
		});
			
		}).catch(function(error){
			console.log("getSearchData",error);
		});
	};

		
});


var getFeaturedData = exports.getFeaturedData = createAliasedAction( "getFeaturedData", function (){
	return function(dispatch){

		courses.getSearchData(10).then(function({data}){
					
			setResultCount(dispatch,data);
			
			data.forEach(function(course){
				dispatch({
					"type": "addCourse2",
					"payload": course
				});
	//			console.log("beforeCourseRoot",course);

				dispatch(getCourseRoot(course.content_address));
		});
			
		}).catch(function(error){
			console.log("getFeaturedData",error);
		});
	};

		
});




 var dispatchCourseRoot = exports.dispatchCourseRoot = createAliasedAction("dispatchCourseRoot", function(course){

 	return function(dispatch){

			console.log("dispatchCourseRoot",course);
			dispatch(getCourseRoot(course));

 	}
	}

 );


var setResultCount = function(dispatch,data){
			dispatch({
					"type": "setResultCount",
					"payload": data.length
				});
}

var createPageMap = function(dispatch,data){
		dispatch({
					"type": "createPageMap",
					"payload": data
				});

}

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
		}).catch(function(error){
			console.log("getFeatured","Failed");
		});
	};
});


var getCourseRoot = exports.getCourseRoot = createAliasedAction( "getCourseRoot", function (hash){
	return function(dispatch){
		console.log("hashroot",hash);
		courses.getCourseRoot(hash).then(function({data}){
//			console.log("getcourseroot",data);
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
		}).catch(function(error){
			console.log("getCourseRoot","Failed",hash);
			courses.getCourseRoot(hash);
			console.log("getCourseRoot","retry",hash);
		});
	};
});

var getCourseDirectory = exports.getCourseDirectory = createAliasedAction( "getCourseDirectory", function(id, hash){
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function({data}){
//			console.log("getcoursedir",data);
			data.Links.forEach(function(link){
	//		console.log("loink",link);
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
		}).catch(function(error){
			console.log("getCourseDirectory","Failed");
		});
	};
} );


var getCourseContentsDirectroy = exports.getCourseContentsDirectroy = createAliasedAction( "getCourseContentsDirectroy", function(id, hash, courseDirectoryHash){
//	console.log("_____________________",id,hash,courseDirectoryHash);
	return function(dispatch){
		courses.getCourseDirectory(hash).then(function({data}){
	//		console.log("ccc",data);
			data.Links.forEach(function(link){
//				console.log("links",link);
            	if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){    
                   	console.log("image****************************",link.Name);
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
		}).catch(function(error){
			console.log("getCourseDirectory","Failed");
		});
	};
} );