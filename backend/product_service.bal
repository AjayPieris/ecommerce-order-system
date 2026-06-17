import ballerina/http;
import ballerina/log;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;
import ballerina/sql;
import ballerina/jwt;

// product record types

type Product record {|
    int id;
    string name;
    string description;
    decimal price;
    int stock_quantity;
    string image_url;
    string category;
|};

type NewProduct record {|
    string name;
    string description;
    decimal price;
    int stock_quantity;
    string image_url;
    string category;
|};

type UpdateStock record {|
    int stock_quantity;
|};

// db config
configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbName = ?;
configurable string dbUser = ?;
configurable string dbPassword = ?;

final postgresql:Client dbClient = check new (
    host = dbHost,
    port = dbPort,
    database = dbName,
    username = dbUser,
    password = dbPassword,
    options = {
        ssl: {mode: postgresql:REQUIRE}
    }
);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/products on new http:Listener(9090) {

    // get all products
    resource function get .() returns Product[]|error {
        log:printInfo("Fetching all products");

        sql:ParameterizedQuery query = `SELECT id, name, description, price, 
                                        stock_quantity, image_url, category 
                                        FROM products ORDER BY id`;

        stream<Product, sql:Error?> productStream = dbClient->query(query);
        Product[] products = [];

        check from Product p in productStream
            do {
                products.push(p);
            };

        return products;
    }

    // get single product by id
    resource function get [int id]() returns Product|http:NotFound|error {
        log:printInfo("Fetching product #" + id.toString());

        sql:ParameterizedQuery query = `SELECT id, name, description, price,
                                        stock_quantity, image_url, category
                                        FROM products WHERE id = ${id}`;

        Product|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    // filter products by category
    resource function get category/[string categoryName]() returns Product[]|error {
        log:printInfo("Fetching products in category: " + categoryName);

        sql:ParameterizedQuery query = `SELECT id, name, description, price,
                                        stock_quantity, image_url, category
                                        FROM products WHERE category = ${categoryName}
                                        ORDER BY id`;

        stream<Product, sql:Error?> productStream = dbClient->query(query);
        Product[] products = [];

        check from Product p in productStream
            do {
                products.push(p);
            };

        return products;
    }

    // create new product (admin only)
    resource function post .(http:Request req, NewProduct newProduct) returns Product|http:Unauthorized|http:Forbidden|error {
        jwt:Payload|http:Unauthorized authResult = validateToken(req);
        if authResult is http:Unauthorized {
            return authResult;
        } else if !isAdmin(authResult) {
            return http:FORBIDDEN;
        }

        log:printInfo("Creating new product: " + newProduct.name);

        sql:ParameterizedQuery query = `INSERT INTO products 
                                        (name, description, price, stock_quantity, image_url, category)
                                        VALUES (${newProduct.name}, ${newProduct.description},
                                        ${newProduct.price}, ${newProduct.stock_quantity},
                                        ${newProduct.image_url}, ${newProduct.category})
                                        RETURNING id, name, description, price, 
                                        stock_quantity, image_url, category`;

        Product result = check dbClient->queryRow(query);
        return result;
    }

    // update existing product
    resource function put [int id](NewProduct updatedProduct) returns Product|http:NotFound|error {
        log:printInfo("Updating product #" + id.toString());

        sql:ParameterizedQuery query = `UPDATE products SET
                                        name = ${updatedProduct.name},
                                        description = ${updatedProduct.description},
                                        price = ${updatedProduct.price},
                                        stock_quantity = ${updatedProduct.stock_quantity},
                                        image_url = ${updatedProduct.image_url},
                                        category = ${updatedProduct.category}
                                        WHERE id = ${id}
                                        RETURNING id, name, description, price,
                                        stock_quantity, image_url, category`;

        Product|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    // update just the stock quantity
    resource function put [int id]/stock(UpdateStock stockUpdate) returns Product|http:NotFound|error {
        log:printInfo("Updating stock for product #" + id.toString());

        sql:ParameterizedQuery query = `UPDATE products SET
                                        stock_quantity = ${stockUpdate.stock_quantity}
                                        WHERE id = ${id}
                                        RETURNING id, name, description, price,
                                        stock_quantity, image_url, category`;

        Product|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    // delete a product
    resource function delete [int id]() returns http:Ok|http:NotFound|error {
        log:printInfo("Deleting product #" + id.toString());

        sql:ParameterizedQuery query = `DELETE FROM products WHERE id = ${id}`;
        sql:ExecutionResult result = check dbClient->execute(query);

        if result.affectedRowCount == 0 {
            return http:NOT_FOUND;
        }

        return http:OK;
    }
}