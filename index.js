const _ = require('lodash')

/**
 * @class Store
 */
class Store {

    /**
     * @param {Object} initialState 
     * @param {Object} reducers 
     * @param {Object} options 
     */
    constructor(initialState, reducers, options) {
        this.state = _.clone(initialState)
        this.reducers = reducers
        this.subscribers = new Set([])
        this.logging = options.logging || false
        this.enableLogging = !!options.enableLogging

        /**
         * Dispatch an action
         * @method dispatch
         * @param {Object} action 
         * @param {Boolean} silent 
         * @param {Boolean} clone
         */
        this.dispatch = (action, silent, clone = true) => {

            if (Array.isArray(action)) {

                action.forEach((_action, i) => {    
                    let isLastAction = (i < (action.length - 1)),
                        _silent = silent || isLastAction,
                        shouldClone = isLastAction ? clone : false
                    this.dispatch(_action, _silent, shouldClone)
                })

                return this.subscribers.forEach(fn => fn(this.state))
            }

            var reducer = _.get(this.reducers, action.type),
                enableLogging = this.enableLogging,
                groupLogging = (typeof console.groupCollapsed === 'function')

            if (typeof reducer === 'function') {

                if (enableLogging) {
                    if (groupLogging) {
                        console.groupCollapsed(action.type)
                        console.log(action)
                    } else {
                        console.log('action type:', action.type)
                        console.log('action:', JSON.stringify(action))
                    }
                }

                try {
                    var newState = reducer(this.getState(clone), action, this.dispatch)
                    this.state = newState
                } catch (err) {
                    if (enableLogging) {
                        console.log(`Error occoured while dispatching ${action.type}`)
                        console.log(err)
                        console.log(action)
                    }
                }

                if (groupLogging && enableLogging) console.groupEnd()

                if (!silent) {
                    this.subscribers.forEach((fn) => {
                        fn(this.state)
                    })
                }

            } else {
                if (enableLogging) {
                    console.log(`No reducer exists for action type "${action.type}"`)
                    console.log(action)
                    console.log()
                }
            }

        }

    }

    /**
     * Get the current state of the store. 
     * Becaue the cloneDeep method uses a non-trivial amount of computation I've made it optional.
     * this is useful when dispatching an array of actions and gives the application the opportunity
     * to prevent unnecessary calls to any subscribed change handlers.
     * @method getState
     * @param {Boolean} copy 
     */
    getState(copy) {
        return copy ? _.cloneDeep(this.state) : this.state
    }

    /**
     * @method subscribe
     * @param {Function} fn 
     */
    subscribe(fn) {
        if (!this.subscribers.has(fn))
            this.subscribers.add(fn)
    }

    /**
     * @method unsubscribe
     * @param {Function} fn 
     */
    unsubscribe(fn) {
        this.subscribers.remove(fn)
    }

}

module.exports = Store