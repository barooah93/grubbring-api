module.exports = function() {
    var email = "";
    return {
        getEmail: function() {
            return email;
        },
        setEmail: function(value) {
            email = value;
        }
    };
};
