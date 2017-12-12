// modify the state of courses here


const initialState = {
    isFetching: false,
    didInvalidate: false,
	items: []
};


module.exports = function courses(state, action){	
	state = state || initialState;

	switch (action.type){
		case "addCourse":
			return Object.assign({}, state, {
				courses: [
					...state.courses.items,
					{
						// course info from action here
					}
				]
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