import ballerina/http;
import ballerina/log;
import ballerina/sql;

type Customer record {|
    int id;
    string asgardeo_user_id;
    string email;
    string full_name;
    string phone;
    string address;
|};

type NewCustomer record {|
    string asgardeo_user_id;
    string email;
    string full_name;
    string phone;
    string address;
|};

type UpdateCustomer record {|
    string full_name;
    string phone;
    string address;
|};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/customers on new http:Listener(9092) {

    // register a new customer (called on first login)
    resource function post .(NewCustomer newCustomer) returns Customer|http:Conflict|error {
        log:printInfo("Registering customer: " + newCustomer.email);

        // check if this user already exists
        sql:ParameterizedQuery checkQuery = `SELECT id, asgardeo_user_id, email, 
                                             full_name, phone, address
                                             FROM customers 
                                             WHERE asgardeo_user_id = ${newCustomer.asgardeo_user_id}`;

        Customer|sql:Error existing = dbClient->queryRow(checkQuery);

        if existing is Customer {
            // already registered, just return what we have
            return existing;
        }

        // insert new customer
        sql:ParameterizedQuery insertQuery = `INSERT INTO customers
                                              (asgardeo_user_id, email, full_name, phone, address)
                                              VALUES (${newCustomer.asgardeo_user_id},
                                              ${newCustomer.email}, ${newCustomer.full_name},
                                              ${newCustomer.phone}, ${newCustomer.address})
                                              RETURNING id, asgardeo_user_id, email,
                                              full_name, phone, address`;

        Customer result = check dbClient->queryRow(insertQuery);
        log:printInfo("Customer created with id " + result.id.toString());
        return result;
    }

    // get all customers
    resource function get .() returns Customer[]|error {
        log:printInfo("Fetching all customers");

        sql:ParameterizedQuery query = `SELECT id, asgardeo_user_id, email,
                                        full_name, phone, address
                                        FROM customers ORDER BY id`;

        stream<Customer, sql:Error?> customerStream = dbClient->query(query);
        Customer[] customers = [];

        check from Customer c in customerStream
            do {
                customers.push(c);
            };

        return customers;
    }

    // get single customer by id
    resource function get [int id]() returns Customer|http:NotFound|error {
        log:printInfo("Fetching customer #" + id.toString());

        sql:ParameterizedQuery query = `SELECT id, asgardeo_user_id, email,
                                        full_name, phone, address
                                        FROM customers WHERE id = ${id}`;

        Customer|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    // lookup customer by their asgardeo user id
    resource function get byuser/[string asgardeoId]() returns Customer|http:NotFound|error {
        log:printInfo("Looking up customer by asgardeo id: " + asgardeoId);

        sql:ParameterizedQuery query = `SELECT id, asgardeo_user_id, email,
                                        full_name, phone, address
                                        FROM customers 
                                        WHERE asgardeo_user_id = ${asgardeoId}`;

        Customer|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    // update customer profile info
    resource function put [int id](UpdateCustomer updateData) returns Customer|http:NotFound|error {
        log:printInfo("Updating customer #" + id.toString());

        sql:ParameterizedQuery query = `UPDATE customers SET
                                        full_name = ${updateData.full_name},
                                        phone = ${updateData.phone},
                                        address = ${updateData.address}
                                        WHERE id = ${id}
                                        RETURNING id, asgardeo_user_id, email,
                                        full_name, phone, address`;

        Customer|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }
}