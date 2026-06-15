import ballerina/http;
import ballerina/log;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;
import ballerina/sql;
import ballerina/time;

// ─── Types ───────────────────────────────────────────────

type OrderItem record {|
    int product_id;
    int quantity;
    decimal unit_price;
|};

type NewOrder record {|
    int customer_id;
    string shipping_address;
    OrderItem[] items;
|};

type OrderResponse record {|
    int id;
    int customer_id;
    decimal total_amount;
    string status;
    string payment_status;
    string shipping_address;
    string created_at;
|};

type OrderItemResponse record {|
    int id;
    int order_id;
    int product_id;
    string product_name;
    int quantity;
    decimal unit_price;
    decimal subtotal;
|};

type FullOrderResponse record {|
    int id;
    int customer_id;
    decimal total_amount;
    string status;
    string payment_status;
    string shipping_address;
    string created_at;
    OrderItemResponse[] items;
|};

type StockCheckResult record {|
    int id;
    string name;
    int stock_quantity;
|};

type UpdateOrderStatus record {|
    string status;
|};

// ─── Order Service ───────────────────────────────────────

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/orders on new http:Listener(9091) {

    // POST /api/orders — place a new order (MAIN ORCHESTRATION)
    resource function post .(NewOrder newOrder) returns FullOrderResponse|http:BadRequest|error {
        log:printInfo("New order received for customer: " + newOrder.customer_id.toString());

        // ── Step 1: Check stock for all items ──────────────
        log:printInfo("Step 1: Checking stock availability...");

        foreach OrderItem item in newOrder.items {
            sql:ParameterizedQuery stockQuery = `SELECT id, name, stock_quantity 
                                                  FROM products WHERE id = ${item.product_id}`;

            StockCheckResult|sql:Error product = dbClient->queryRow(stockQuery);

            if product is sql:NoRowsError {
                http:BadRequest badReq = {
                    body: {message: "Product not found: " + item.product_id.toString()}
                };
                return badReq;
            }

            if product is sql:Error {
                return product;
            }

            if product.stock_quantity < item.quantity {
                http:BadRequest badReq = {
                    body: {
                        message: "Insufficient stock for: " + product.name +
                                 ". Available: " + product.stock_quantity.toString() +
                                 ", Requested: " + item.quantity.toString()
                    }
                };
                return badReq;
            }

            log:printInfo("Stock OK for: " + product.name);
        }
    }
}