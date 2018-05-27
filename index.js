const _ = require('lodash')

class Store {
    
    constructor (initialState, reducers, options) {
        this.state = _.clone(initialState)
        this.reducers = reducers
        this.subscribers = new Set([])
    }

    dispatch (action) {
        
        if(Array.isArray(action)) return action.forEach(dispatch)
        
        var reducer = _.get(this.reducers, action.type)
        
        if(typeof reducer === 'function') {
            this.state = reducer(this.state, action, this.dispatch)
            this.subscribers.forEach( fn => fn(this.state) )
        }

    }

    getState () {
        return _.clone(this.state)
    }

    subscribe (fn) {
        if(!this.subscribers.has(fn))
            this.subscribers.add(fn)
    }

    unsubscribe (fn) {
        this.subscribers.remove(fn)
    }

}

module.exports = Store