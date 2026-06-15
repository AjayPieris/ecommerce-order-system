import ballerina/http;
import ballerina/log;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;
import ballerina/sql;

// ─── Types ───────────────────────────────────────────────

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

// ─── Customer Service ─────────────────────────────────────

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/customers on new http:Listener(9092) {

    // POST /api/customers — register customer (called on first login)
    resource function post .(NewCustomer newCustomer) returns Customer|http:Conflict|error {
        log:printInfo("Registering customer: " + newCustomer.email);

        // Check if already exists
        sql:ParameterizedQuery checkQuery = `SELECT id, asgardeo_user_id, email, 
                                             full_name, phone, address
                                             FROM customers 
                                             WHERE asgardeo_user_id = ${newCustomer.asgardeo_user_id}`;

        Customer|sql:Error existing = dbClient->queryRow(checkQuery);

        if existing is Customer {
            // Already registered → return existing
            return existing;
        }

        // Create new customer
        sql:ParameterizedQuery insertQuery = `INSERT INTO customers
                                              (asgardeo_user_id, email, full_name, phone, address)
                                              VALUES (${newCustomer.asgardeo_user_id},
                                              ${newCustomer.email}, ${newCustomer.full_name},
                                              ${newCustomer.phone}, ${newCustomer.address})
                                              RETURNING id, asgardeo_user_id, email,
                                              full_name, phone, address`;

        Customer result = check dbClient->queryRow(insertQuery);
        log:printInfo("✅ Customer created: " + result.id.toString());
        return result;
    }

    // GET /api/customers — get all customers (admin only)
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

// GET /api/customers/[id] — get single customer
    resource function get [int id]() returns Customer|http:NotFound|error {
        log:printInfo("Fetching customer: " + id.toString());

        sql:ParameterizedQuery query = `SELECT id, asgardeo_user_id, email,
                                        full_name, phone, address
                                        FROM customers WHERE id = ${id}`;

        Customer|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    // GET /api/customers/byuser/[asgardeoId] — get by Asgardeo user ID
    resource function get byuser/[string asgardeoId]() returns Customer|http:NotFound|error {
        log:printInfo("Fetching customer by Asgardeo ID: " + asgardeoId);

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

    // PUT /api/customers/[id] — update customer profile
    resource function put [int id](UpdateCustomer updateData) returns Customer|http:NotFound|error {
        log:printInfo("Updating customer: " + id.toString());

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