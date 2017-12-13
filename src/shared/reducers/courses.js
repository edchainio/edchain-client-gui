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
			state = Object.assign({}, state, {
				items: Object.assign({}, clone(state.items), item)
			});
			break;
		case "setHash":
			state.items[action.payload.id];
			var copy = clone(state.items[action.payload.id]);
			copy.META.hashes[action.payload.key] = action.payload.value;
			var item = {};
			item[action.payload.id] = copy;
			state = Object.assign({}, state, {
				"items": Object.assign({}, clone(state.items), item)
			});
			break;
		case "setUrl":
			var copy = clone(state.items[action.payload.id]);
			copy.META.urls[action.payload.key] = action.payload.value;
			var item = {};
			item[action.payload.id] = copy;
			state = Object.assign({}, state, {
				"items": Object.assign({}, clone(state.items), item)
			});
			break;
		case "addPin":
			// state = Object.assign({}, state, { "id": action.payload });
		case "removePin":
			// state = Object.assign({}, state, { "id": action.payload });
		case "checkPin":
			// state = Object.assign({}, state, { "id": action.payload });
		default:
			state = state;
	}
	return state
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