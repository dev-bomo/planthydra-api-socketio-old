var Dispatcher = function () {

    var events = {};

    var addListener = function (event, callback) {
        if (events[event] === undefined) {
            events[event] = {
                listeners: []
            };
        }
        events[event].listeners.push(callback);
    }

    var removeListener = function (event, callback) {
        if (events[event] === undefined) {
            return false;
        }
        events[event].listeners = events[event].listeners.filter(
            (listener) => {
                return listener.toString() !== callback.toString();
            }
        );
    }

    var dispatch = function (event, data) {
        if (events[event] === undefined) {
            return false;
        }
        events[event].listeners.forEach((listener) => {
            listener(data);
        });
    }

    return {
        addListener: addListener,
        removeListener: removeListener,
        dispatch: dispatch
    }
}();

module.exports = Dispatcher;