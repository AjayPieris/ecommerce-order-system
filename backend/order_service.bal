import ballerina/http;
import ballerina/log;
import ballerina/sql;

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

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/orders on new http:Listener(9091) {

    // place a new order - this is the main flow that handles
    // stock check, payment, order creation, and shipment
    resource function post .(NewOrder newOrder) returns FullOrderResponse|http:BadRequest|error {
        log:printInfo("New order request from customer " + newOrder.customer_id.toString());

        // check if we have enough stock for everything
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

            log:printInfo("Stock OK - " + product.name);
        }

        // calculate total
        decimal totalAmount = 0;
        foreach OrderItem item in newOrder.items {
            totalAmount += item.unit_price * item.quantity;
        }
        log:printInfo("Order total: $" + totalAmount.toString());

        // process payment (mock for now)
        boolean paymentSuccess = check processMockPayment(totalAmount);

        if !paymentSuccess {
            http:BadRequest badReq = {
                body: {message: "Payment failed. Please try again."}
            };
            return badReq;
        }
        log:printInfo("Payment confirmed");

        // insert the order record
        sql:ParameterizedQuery orderQuery = `INSERT INTO orders 
                                             (customer_id, total_amount, status, 
                                              payment_status, shipping_address)
                                             VALUES (${newOrder.customer_id}, ${totalAmount},
                                             'PAYMENT_CONFIRMED', 'PAID', ${newOrder.shipping_address})
                                             RETURNING id, customer_id, total_amount, status,
                                             payment_status, shipping_address,
                                             created_at::text as created_at`;

        OrderResponse createdOrder = check dbClient->queryRow(orderQuery);
        log:printInfo("Order #" + createdOrder.id.toString() + " created");

        // save each item and deduct stock
        foreach OrderItem item in newOrder.items {
            decimal subtotal = item.unit_price * item.quantity;

            sql:ParameterizedQuery itemQuery = `INSERT INTO order_items
                                                (order_id, product_id, quantity, unit_price, subtotal)
                                                VALUES (${createdOrder.id}, ${item.product_id},
                                                ${item.quantity}, ${item.unit_price}, ${subtotal})`;
            _ = check dbClient->execute(itemQuery);

            // deduct from stock
            sql:ParameterizedQuery stockDeductQuery = `UPDATE products 
                                                        SET stock_quantity = stock_quantity - ${item.quantity}
                                                        WHERE id = ${item.product_id}`;
            _ = check dbClient->execute(stockDeductQuery);

            log:printInfo("Deducted stock for product " + item.product_id.toString());
        }

        // trigger shipment
        check triggerMockShipment(createdOrder.id, newOrder.shipping_address);

        // mark as processing now
        sql:ParameterizedQuery updateStatusQuery = `UPDATE orders SET status = 'PROCESSING'
                                                    WHERE id = ${createdOrder.id}`;
        _ = check dbClient->execute(updateStatusQuery);

        // log a notification
        sql:ParameterizedQuery notifQuery = `INSERT INTO notifications 
                                             (order_id, type, message)
                                             VALUES (${createdOrder.id}, 'EMAIL',
                                             ${"Order #" + createdOrder.id.toString() + 
                                             " confirmed! Total: $" + totalAmount.toString()})`;
        _ = check dbClient->execute(notifQuery);

        // build and return the full response
        log:printInfo("Order #" + createdOrder.id.toString() + " flow complete");

        OrderItemResponse[] orderItems = check getOrderItems(createdOrder.id);

        FullOrderResponse response = {
            id: createdOrder.id,
            customer_id: createdOrder.customer_id,
            total_amount: createdOrder.total_amount,
            status: "PROCESSING",
            payment_status: createdOrder.payment_status,
            shipping_address: createdOrder.shipping_address,
            created_at: createdOrder.created_at,
            items: orderItems
        };

        return response;
    }

    // get all orders
    resource function get .() returns OrderResponse[]|error {
        log:printInfo("Fetching all orders");

        sql:ParameterizedQuery query = `SELECT id, customer_id, total_amount, status,
                                        payment_status, shipping_address,
                                        created_at::text as created_at
                                        FROM orders ORDER BY created_at DESC`;

        stream<OrderResponse, sql:Error?> orderStream = dbClient->query(query);
        OrderResponse[] orders = [];

        check from OrderResponse o in orderStream
            do {
                orders.push(o);
            };

        return orders;
    }

    // get a single order with its items
    resource function get [int id]() returns FullOrderResponse|http:NotFound|error {
        log:printInfo("Fetching order #" + id.toString());

        sql:ParameterizedQuery query = `SELECT id, customer_id, total_amount, status,
                                        payment_status, shipping_address,
                                        created_at::text as created_at
                                        FROM orders WHERE id = ${id}`;

        OrderResponse|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        if result is sql:Error {
            return result;
        }

        OrderItemResponse[] items = check getOrderItems(id);

        FullOrderResponse fullOrder = {
            id: result.id,
            customer_id: result.customer_id,
            total_amount: result.total_amount,
            status: result.status,
            payment_status: result.payment_status,
            shipping_address: result.shipping_address,
            created_at: result.created_at,
            items: items
        };

        return fullOrder;
    }

    // get orders for a specific customer
    resource function get customer/[int customerId]() returns OrderResponse[]|error {
        log:printInfo("Fetching orders for customer " + customerId.toString());

        sql:ParameterizedQuery query = `SELECT id, customer_id, total_amount, status,
                                        payment_status, shipping_address,
                                        created_at::text as created_at
                                        FROM orders WHERE customer_id = ${customerId}
                                        ORDER BY created_at DESC`;

        stream<OrderResponse, sql:Error?> orderStream = dbClient->query(query);
        OrderResponse[] orders = [];

        check from OrderResponse o in orderStream
            do {
                orders.push(o);
            };

        return orders;
    }

    // update order status
    resource function put [int id]/status(UpdateOrderStatus statusUpdate) 
                                          returns OrderResponse|http:NotFound|error {
        log:printInfo("Updating status for order #" + id.toString() + " to " + statusUpdate.status);

        sql:ParameterizedQuery query = `UPDATE orders SET status = ${statusUpdate.status},
                                        updated_at = CURRENT_TIMESTAMP
                                        WHERE id = ${id}
                                        RETURNING id, customer_id, total_amount, status,
                                        payment_status, shipping_address,
                                        created_at::text as created_at`;

        OrderResponse|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }
}

// simulates payment processing - would call stripe/paypal in production
function processMockPayment(decimal amount) returns boolean|error {
    log:printInfo("Processing payment of $" + amount.toString());
    // TODO: integrate with actual payment gateway
    return true;
}

// simulates triggering a shipment
function triggerMockShipment(int orderId, string address) returns error? {
    log:printInfo("Shipment triggered for order #" + orderId.toString() + " to " + address);
    // TODO: hook up to shipping provider API
}

// helper to fetch order items joined with product names
function getOrderItems(int orderId) returns OrderItemResponse[]|error {
    sql:ParameterizedQuery query = `SELECT oi.id, oi.order_id, oi.product_id,
                                    p.name as product_name, oi.quantity,
                                    oi.unit_price, oi.subtotal
                                    FROM order_items oi
                                    JOIN products p ON oi.product_id = p.id
                                    WHERE oi.order_id = ${orderId}`;

    stream<OrderItemResponse, sql:Error?> itemStream = dbClient->query(query);
    OrderItemResponse[] items = [];

    check from OrderItemResponse item in itemStream
        do {
            items.push(item);
        };

    return items;
}