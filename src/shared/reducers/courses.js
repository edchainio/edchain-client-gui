// modify the state of courses here

const log = require('electron-log');

const initialState = {
    isFetching: false,
    didInvalidate: false,
	items: {}
};


module.exports = function courses(state, action){	
	state = state || initialState;
	switch (action.type){
		case "addCourse":
			var item = {};
			item[action.payload.hash] = courseItem(action.payload);
			return Object.assign({}, state, {
				items: Object.assign({}, clone(state.items), item)
			});
		case "setHash":
			state.items[action.payload.id];
			var copy = clone(state.items[action.payload.id]);
			copy.META.hashes[action.payload.key] = action.payload.value;
			var item = {};
			item[action.payload.id] = copy;
			return Object.assign({}, state, {
				"items": Object.assign({}, clone(state.items), item)
			});
		case "setUrl":
			var copy = clone(state.items[action.payload.id]);
			copy.META.urls[action.payload.key] = action.payload.value;
			var item = {};
			item[action.payload.id] = copy;
			return Object.assign({}, state, {
				"items": Object.assign({}, clone(state.items), item)
			});
		// these three require further inspection
		case "addPin":
		case "removePin":
		case "checkPin":
			var copy = clone(state.items[action.payload.id]);
			copy.META.isPinned = !!action.payload.value;
			var item = {};
			item[action.payload.id] = copy;
			return Object.assign({}, state, {
				"items": Object.assign({}, clone(state.items), item)
			});
		default:
			return state;
	}
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