const { combineReducers } = require('redux');

// how to update ipfs state and courses state
const ipfs = require('./ipfs');
const courses = require('./courses');

module.exports = function getRootReducer(scope = 'main') {
	let reducers = {
		ipfs,
		courses
	};

	if (scope === 'renderer') {
		// reducers = Object.assign({}, reducers);
	}

	return combineReducers(reducers);
};