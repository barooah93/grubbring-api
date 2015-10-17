/**
 * Created by Urvesh on 10/14/15.
 */

var debug = require('debug');

module.exports = function (name) {
    return {
        log: console.log.bind(console),
        error: debug('grubbring:' + name)
    }
};
