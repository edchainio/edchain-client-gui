// modify the state of courses here

const log = require('electron-log');
const { createReducer } = require('../helpers/index.js');

const initialState = {
    isFetching: false,
    didInvalidate: false,
	items: {},
	isSearch:false
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
	console.log("courseItem2",course);
	return Object.assign({}, course, {
		"id": course.content_address,
	    "META": {
	        "hashes": {
	        	"courseRootHash": course.content_address
	        },
	        "urls": {}
	    }
    });
};

var updateCourseItem = function(state, action, update){
	var item = {};
	console.log("action",action,update);
	console.log("updateCourseItem");
	item[action.payload.id] = clone(state.items[action.payload.id]);
//	console.log(item,"yoyo");
	update(item[action.payload.id], action);
	
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
	"addCourse": function(state, action){
		var item = {};
		item[action.payload.hash] = courseItem(action.payload);
		return Object.assign({}, state, {
			items: Object.assign({}, clone(state.items), item)
		});
	},
	"addCourse2": function(state, action){
		var item = {};
		console.log("addCourse2",action);
		item[action.payload.content_address] = courseItem2(action.payload);
		return Object.assign({}, state, {
			items: Object.assign({}, clone(state.items), item)
		});
	},
	"setHash": function(state, action){
		console.log("sethash");
		//console.log(state,action);
		return updateCourseItem(state, action, function(copy, action){
			copy.META.hashes[action.payload.key] = action.payload.value;
		});
	},
	"setUrl": function(state, action){
		return updateCourseItem(state, action, function(copy, action){
			copy.META.urls[action.payload.key] = action.payload.value;
		});
	},
	"setIsPinned": function(state, action){
		return updateCourseItem(state, action, function(copy, action){
			copy.META.isPinned = !!action.payload.value;
		});
	}
});