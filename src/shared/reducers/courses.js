// modify the state of courses here

const log = require('electron-log');
const { createReducer } = require('../helpers/index.js');

const initialState = {
    isFetching: false,
    didInvalidate: false,
	items: {}
};


var setIsPinned = function(state, action){
	var copy = clone(state.items[action.payload.id]);
	copy.META.isPinned = !!action.payload.value;
	var item = {};
	item[action.payload.id] = copy;
	return Object.assign({}, state, {
		"items": Object.assign({}, clone(state.items), item)
	});
};

var courseItem = function(course){
	return Object.assign({}, course, {
	    "META": {
	        "hashes": {
	        	"courseRootHash": course.hash
	        },
	        "urls": {}
	    }
    });
};

var clone = function(obj){
	// issue with this
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
	"setHash": function(state, action){
		var copy = clone(state.items[action.payload.id]);
		copy.META.hashes[action.payload.key] = action.payload.value;
		var item = {};
		item[action.payload.id] = copy;
		return Object.assign({}, state, {
			"items": Object.assign({}, clone(state.items), item)
		});
	},
	"setUrl": function(state, action){
		var copy = clone(state.items[action.payload.id]);
		copy.META.urls[action.payload.key] = action.payload.value;
		var item = {};
		item[action.payload.id] = copy;
		return Object.assign({}, state, {
			"items": Object.assign({}, clone(state.items), item)
		});
	},
	"setIsPinned": setIsPinned
});