// https://raw.githubusercontent.com/hardchor/timesheets/4991fd472dbb12b0c6e6806c6a01ea3385ab5979/app/shared/store/configureStore.js


const { createStore, applyMiddleware, compose } = require('redux');
// import { persistState } = require('redux-devtools');
const  thunk = require('redux-thunk').default;

// const createLogger = require('redux-logger');

// defaults to the file in the folder named index.js
const getRootReducer = require('../reducers');

const {
	forwardToMain,
	forwardToRenderer,
	triggerAlias,
	replayActionMain,
	replayActionRenderer,
} = require('electron-redux');

/**
 * @param  {Object} initialState
 * @param  {String} [scope='main|renderer']
 * @return {Object} store
 */
module.exports = function configureStore(initialState, scope) {
	scope = scope || 'main';

	let middleware = [
		thunk
	];

	if (scope === 'renderer') {
		middleware = [
			forwardToMain,
			router,
			...middleware,
		];
	}

	if (scope === 'main') {
		middleware = [
			triggerAlias,
			...middleware,
			forwardToRenderer,
		];
	}

	const rootReducer = getRootReducer(scope);
	const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));

	if (!process.env.NODE_ENV && module.hot) {
		module.hot.accept('../reducers', () => {
			store.replaceReducer(require('../reducers'));
		});
	}

	if (scope === 'main') {
		replayActionMain(store);
	} else {
		replayActionRenderer(store);
	}

	return store;
};