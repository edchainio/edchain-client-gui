// make actionCreators here and define action types
const { createAliasedAction } = require("electron-redux");
const { addPin, removePin, checkPin } = require("./ipfs");
const courses = require("../../api/courses");

// action creators

var getFeatured = createAliasedAction( "getFeatured", function (){
	return function(dispatch){
		courses.getFeatured().then(function(data){
			dispatch(getCourseRoot(course));
		});
	};
});


var getCourseRoot = createAliasedAction( "getCourseRoot", function (course){
	return function(dispatch){
		course.META = {
	        "hashes": {
	        	"courseRootHash": course.hash
	        }
	    };
		courses.getCourseRoot(course.hash).then(function(data){
			course.META.hashes.courseDirectoryHash = data["Links"][0].Hash;
			dispatch(getCourseDirectory(course))
		});
	};
});

var getCourseDirectory = createAliasedAction( "getCourseDirectory", function(course){
	return function(dispatch){
		courses.getCourseDirectory(course.META.hashes.courseDirectoryHash).then(function(directory){
			directory.Links.forEach(function(link){
            	if(link.Name !== "contents") return;

            	course.META.hashes.contentsDirectoryHash = link.Hash;
            	dispatch(getCourseContentsDirectroy(course));
            });
		});
	};
} );


var getCourseContentsDirectroy = createAliasedAction( "getCourseContentsDirectroy", function(course){
	return function(dispatch){
		courses.getCourseContentsDirectroy(course.META.hashes.contentsDirectoryHash).then(function(contents){
			contents.Links.forEach(function(link){
            	if (link.Name.endsWith('jpg')  && !link.Name.endsWith('th.jpg')){
                    
                    course.META.imageUrl = courses.buildImageUrl(link.Hash);

                } else if (link.Name.endsWith('index.htm')){
                    
                    course.META.indexUrl = courses.buildIndexUrl(couse.META.hashes.courseDirectoryHash);
                }
            });
		});
	};
} );