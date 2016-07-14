function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define('NUMBER_OF_CREATED_RINGS_ALLOWED', 4); // Request to join a ring successful.