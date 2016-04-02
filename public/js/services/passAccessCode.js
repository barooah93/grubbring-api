module.exports = function() {
    var accessCode = "";
    return {
        getAccessCode: function() {
            return accessCode;
        },
        setAccessCode: function(value) {
            accessCode = value;
        }
    };
};
