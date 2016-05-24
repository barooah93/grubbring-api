function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

// -------------- Ring API Status Codes -------------------
define('REQUEST_TO_JOIN_RING_SUCCESS', '10001'); // Request to join a ring successful.
define('REQUEST_TO_JOIN_RING_FAIL', '00002'); // Request to join a ring failed
define('REQUEST_TO_LEAVE_RING_SUCCESS', '10003'); // Request to leave a ring successful
define('CREATE_RING_SUCCESS', '10002'); // Successfully created a new ring
define('CREATE_RING_FAIL','00009'); // Failed to create a new ring
define('DELETE_RING_SUCCESS','10007'); // Successfully deleted a ring
define('DELETE_RING_FAIL','00005'); // Did not return any results for ring search
define('USER_NOT_SUBSCRIBED_TO_RINGS','00007'); // User is not subscribed to any rings (will return map of rings near that person)
define('USER_NOT_LEADER_TO_ANY_RINGS','00006'); // User is not subscribed to any rings (will return map of rings near that person)
//----------------------------------------------------------

// --------------- Activities API Status Codes -------------
define('CREATE_ACTIVITY_SUCCESS','11001'); // Successfully created a new activity
define('CREATE_ACTIVITY_FAIL','00003'); // Failed to create a new activity
define('DELETE_ACTIVITY_SUCCESS','11003'); // Succcessfully deleted an activity
define('NO_ACTIVITIES_FOUND','00013'); // No activities were found (in search or in specific ring)
//----------------------------------------------------------

// --------------- User Access API Status Codes -------------
define('LOGIN_SUCCESS','12001'); // Login successful
define('LOGIN_FAIL','00010'); // Login failed - incorrect password or username
define('PASSWORD_RESET_SUCCESS','12003'); // Password has been successfully reset
define('ACCESS_CODE_VALIDATION_SUCCESS','12007'); // Access code for registered user has been successfully validated
define('UPDATE_USER_PROFILE_SUCCESS','13001'); // Successfully updated user profile page
define('UPDATE_USER_PROFILE_FAIL','00012'); // Error updating user profile page (email, userid, phone number, etc)
//----------------------------------------------------------

// --------------- Orders API Status Codes -----------------
define('CREATE_ORDER_SUCCESS','14001'); // Successfully created a new order
define('CREATE_ORDER_FAIL','00014'); // Failed to create a new order
define('UPDATE_ORDER_SUCCESS','14003'); // Order has been updated successfully 
define('DELETE_ORDER_SUCCESS','14005'); // Successfully deleted an order
//----------------------------------------------------------

// --------------- Other API Status Codes ----------------
define('RETURNED_RINGS_NEAR_USER_SUCCESS','15001'); // Successfully returned rings near user
define('RETRIEVE_USER_LOCATION_FAIL','15002'); // Failed to retrieve user's location
define('RETURNED_GRUBBERIES_NEAR_USER_SUCCESS','15003'); // Successfully returned grubberies near user
//----------------------------------------------------------