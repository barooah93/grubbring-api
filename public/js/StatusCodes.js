var StatusCodes = {
    // -------------- Ring API Status Codes -------------------
    REQUEST_TO_JOIN_RING_SUCCESS: '10001', // Request to join a ring successful.
    REQUEST_TO_JOIN_RING_FAIL: '00002', // Request to join a ring failed
    REQUEST_TO_LEAVE_RING_SUCCESS: '10003', // Request to leave a ring successful
    CREATE_RING_SUCCESS: '10002', // Successfully created a new ring
    CREATE_RING_FAIL:'00009', // Failed to create a new ring
    NUMBER_OF_CREATED_RINGS_EXCEEDED_LIMIT: '00015',
    DELETE_RING_SUCCESS:'10007', // Successfully deleted a ring
    DELETE_RING_FAIL:'00005', // Did not return any results for ring search
    USER_NOT_SUBSCRIBED_TO_RINGS:'00007', // User is not subscribed to any rings (will return map of rings near that person)
    USER_NOT_LEADER_TO_ANY_RINGS:'00006', // User is not leader to any rings
    UPDATE_USER_ACCESS_TO_RING_SUCCESS:'00008',  // Successfully updated user's ring access status
    NO_PENDING_USER_REQUESTS: '00009',  // This ring has no pending user requests
    RECIEVED_PENDING_USER_REQUESTS: '00010', // Retrieved pending user requests to joing ring
    DELETE_USER_REQUEST_SUCCESS: '00011', // Users pending or approved status successfully deleted
    DELETE_USER_REQUEST_FAIL: '00012', // Users pending or approved status delete failed
    RECIEVED_SUBSCRIBED_RINGS_SUCCESS: '00013',  // Successfully returned rings the user is a part of
    //----------------------------------------------------------
    
    // --------------- Activities API Status Codes -------------
    CREATE_ACTIVITY_SUCCESS:'11001', // Successfully created a new activity
    CREATE_ACTIVITY_FAIL:'00003', // Failed to create a new activity
    DELETE_ACTIVITY_SUCCESS:'11003', // Succcessfully deleted an activity
    NO_ACTIVITIES_FOUND:'10013', // No activities were found (in search or in specific ring)
    //----------------------------------------------------------
    
    // --------------- User Access API Status Codes -------------
    LOGIN_SUCCESS:'12001', // Login successful
    LOGIN_FAIL:'00010', // Login failed - incorrect password or username
    PASSWORD_RESET_SUCCESS:'12003', // Password has been successfully reset
    ACCESS_CODE_VALIDATION_SUCCESS:'12007', // Access code for registered user has been successfully validated
    UPDATE_USER_PROFILE_SUCCESS:'13001', // Successfully updated user profile page
    UPDATE_USER_PROFILE_FAIL:'12012', // Error updating user profile page (email: userid: phone number: etc)
    LOGIN_ATTEMPTS_FAIL:'12013',  // Success of login attempts api
    //----------------------------------------------------------
    
    // --------------- Orders API Status Codes -----------------
    CREATE_ORDER_SUCCESS:'14001', // Successfully created a new order
    CREATE_ORDER_FAIL:'00014', // Failed to create a new order
    UPDATE_ORDER_SUCCESS:'14003', // Order has been updated successfully 
    DELETE_ORDER_SUCCESS:'14005', // Successfully deleted an order
    //----------------------------------------------------------
    
    // --------------- Search API Status Codes -----------------
    SEARCH_RESULTS_FOUND:'15001', // Successfully returned search results
    SEARCH_RESULTS_NOT_FOUND:'15002', // Search criteria did not match anything in our database
    //----------------------------------------------------------
    
    // --------------- Other API Status Codes ----------------
    RETURNED_RINGS_NEAR_USER_SUCCESS:'16001', // Successfully returned rings near user
    NO_RINGS_NEAR_USER:'16007',  // No rings found near user
    RETRIEVE_USER_LOCATION_FAIL:'16002', // Failed to retrieve user's location
    RETURNED_GRUBBERIES_NEAR_USER_SUCCESS:'16003', // Successfully returned grubberies near user
    NO_GRUBBERIES_NEAR_USER: '16008',  // No grubberies found near user
    EXECUTED_QUERY_SUCCESS:'16004', // Successfully executed query
    EXECUTED_QUERY_FAIL:'16005', // Cannot execute query
    DATABASE_CONNECTION_FAIL:'16006' // Cannot connect to database
    //----------------------------------------------------------
};