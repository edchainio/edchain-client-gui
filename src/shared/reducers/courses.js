// modify the state of courses here

const log = require('electron-log');
const { createReducer } = require('../helpers/index.js');

const initialState = {
    isFetching: false,
    didInvalidate: false,
	items: {},
	resultCount:0,
	pageSize:10
};

var courseItem = function(course){
//	console.log(course,"course");
	return Object.assign({}, course, {
		"id": course.hash,	
	    "META": {
	        "hashes": {
	        	"courseRootHash": course.hash
	        },
	        "urls": {}
	    }
    });
};

var courseItem2 = function(course){
//	console.log("courseItem2",course);
	return Object.assign({}, course, {
		"id": course.content_address,
	    "META": {
	        "hashes": {
	        	"courseRootHash": course.content_address
	        },
	        "urls": {}
	    },
	    "isDisplayed":false
    });
};

var updateCourseItem = function(state, action, update){
	var item = {};
//	console.log("action",action);
//	console.log("state.items",state.items[action.payload.id]);

	item[action.payload.id] = clone(state.items[action.payload.id]);
	
	update(item[action.payload.id], action);
//	console.log("copy",item[action.payload.id],"action",action);
	return Object.assign({}, state, {
		"items": Object.assign({}, state.items, item)
	});
};

var setCoursesIsFetching = function(state, value){
	return Object.assign({}, state, {
		courses : Object.assign({}, state, {
			isFetching: value
		})
	})
;};

var clone = function(obj){
	// use this sparingly
	return JSON.parse(JSON.stringify(obj));
};

module.exports = createReducer(initialState, {
	"clearState": function(state,action){
		return Object.assign({},state,{items:""});
	},
	"addCourse": function(state, action){
		var item = {};
		item[action.payload.hash] = courseItem(action.payload);
		return Object.assign({}, state, {
			items: Object.assign({}, clone(state.items), item)
		});
	},
	"setResultCount": function(state,action){
	console.log("state----------------",state,action);
	return Object.assign({}, state, { "resultCount": action.payload });
},
	"createPageMap": function(state,action){
		console.log("state----------------",state,action);
		
		var pageMap = new Map();
		let i=0;
		action.payload.forEach(function(val){
		
			pageMap.set(i++,val.content_address);

		});


	return Object.assign({}, state, { "pageMap": pageMap });
},
	
	"addCourse2": function(state, action){
		var item = {};
//		console.log("addCourse2Action",action);		
		item[action.payload.content_address] = courseItem2(action.payload);
	//	console.log("addcourse2State",state);
		return Object.assign({}, state, {
			items: Object.assign({}, clone(state.items), item)
		});
	},
	"setHash": function(state, action){
	//	console.log("sethash");
		//console.log(state,action);
		return updateCourseItem(state, action, function(copy, action){
			copy.META.hashes[action.payload.key] = action.payload.value;
		});
	},
	"setUrl": function(state, action){
	//	console.log("setURL",state,action);
		return updateCourseItem(state, action, function(copy, action){
	//		console.log("updateCourseItem",copy,"action",action);
			copy.META.urls[action.payload.key] = action.payload.value;
	//		console.log("updateCourseItem2",copy,"action",action);

		});
	},
	"setIsPinned": function(state, action){
		return updateCourseItem(state, action, function(copy, action){
			copy.META.isPinned = !!action.payload.value;
		});
	},
	"setIsDisplayed": function(state, action){
		return updateCourseItem(state, action, function(copy, action){
			copy.isDisplayed = action.payload.value;
	});
	}
});