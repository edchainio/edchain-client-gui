// modify the state of courses here


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
			item[action.course.hash] = courseItem(action.course);
			return Object.assign({}, state, {
				items: Object.assign({}, state.items, item)
			});
		case "setHash":
			var copy = clone(state.items[action.id]);
			copy.META.hashes[action.key] = action.value;
			var item = {};
			item[action.id] = copy;
			return Object.assign({}, state, {
				"items": Object.assign({}, state.items, item)
			});
		case "setUrl":
			var copy = clone(state.items[action.id]);
			copy.META.urls[action.key] = action.value;
			var item = {};
			item[action.id] = copy;
			return Object.assign({}, state, {
				"items": Object.assign({}, state.items, item)
			});
		case "addPin":
			// return Object.assign({}, state, { "id": action.payload });
		case "removePin":
			// return Object.assign({}, state, { "id": action.payload });
		case "checkPin":
			// return Object.assign({}, state, { "id": action.payload });
		default:
			return state;
	}
};

var courseItem = function(course){
	return Object.assign({}, action.course, {
	    "META": {
	        "hashes": {
	        	"courseRootHash": course.hash
	        },
	        "urls": {}
	    }
    });
};

var clone = function(obj){
	return JSON.parse(JSON.stringify(obj));
};