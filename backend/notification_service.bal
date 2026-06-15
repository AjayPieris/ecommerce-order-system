import ballerina/http;
import ballerina/log;
import ballerina/sql;

type Notification record {|
    int id;
    int order_id;
    string 'type;
    string message;
    string sent_at;
|};

type NewNotification record {|
    int order_id;
    string 'type;
    string message;
|};

type OrderStatusNotification record {|
    int order_id;
    string customer_email;
    string status;
    decimal total_amount;
|};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/notifications on new http:Listener(9093) {

    // create a notification log entry
    resource function post .(NewNotification newNotif) returns Notification|error {
        log:printInfo("Creating notification for order " + newNotif.order_id.toString());

        sql:ParameterizedQuery query = `INSERT INTO notifications
                                        (order_id, type, message)
                                        VALUES (${newNotif.order_id},
                                        ${newNotif.'type}, ${newNotif.message})
                                        RETURNING id, order_id, type,
                                        message, sent_at::text as sent_at`;

        Notification result = check dbClient->queryRow(query);
        log:printInfo("Notification #" + result.id.toString() + " logged");
        return result;
    }

    // send an order status notification (email)
    resource function post 'order\-status(OrderStatusNotification notif) 
                                         returns http:Ok|error {
        log:printInfo("Sending status notification for order #" + notif.order_id.toString() +
                      " (" + notif.status + ") to " + notif.customer_email);

        string message = buildStatusMessage(
            notif.order_id,
            notif.status,
            notif.total_amount
        );

        // save to db
        sql:ParameterizedQuery query = `INSERT INTO notifications
                                        (order_id, type, message)
                                        VALUES (${notif.order_id}, 'EMAIL', ${message})`;
        _ = check dbClient->execute(query);

        // TODO: send actual email via sendgrid or smtp
        log:printInfo("Email sent to " + notif.customer_email + ": " + message);

        return http:OK;
    }

    // get all notifications
    resource function get .() returns Notification[]|error {
        log:printInfo("Fetching all notifications");

        sql:ParameterizedQuery query = `SELECT id, order_id, type,
                                        message, sent_at::text as sent_at
                                        FROM notifications
                                        ORDER BY sent_at DESC`;

        stream<Notification, sql:Error?> notifStream = dbClient->query(query);
        Notification[] notifications = [];

        check from Notification n in notifStream
            do {
                notifications.push(n);
            };

        return notifications;
    }

    // get notifications for a specific order
    resource function get 'order/[int orderId]() returns Notification[]|error {
        log:printInfo("Fetching notifications for order #" + orderId.toString());

        sql:ParameterizedQuery query = `SELECT id, order_id, type,
                                        message, sent_at::text as sent_at
                                        FROM notifications
                                        WHERE order_id = ${orderId}
                                        ORDER BY sent_at DESC`;

        stream<Notification, sql:Error?> notifStream = dbClient->query(query);
        Notification[] notifications = [];

        check from Notification n in notifStream
            do {
                notifications.push(n);
            };

        return notifications;
    }
}

// builds the email body based on the order status
function buildStatusMessage(int orderId, string status, decimal totalAmount) returns string {
    match status {
        "PAYMENT_CONFIRMED" => {
            return string `Order #${orderId} payment confirmed! Total: $${totalAmount}. We are preparing your order.`;
        }
        "PROCESSING" => {
            return string `Order #${orderId} is now being processed. We will ship it soon!`;
        }
        "SHIPPED" => {
            return string `Great news! Order #${orderId} has been shipped. Total was: $${totalAmount}.`;
        }
        "DELIVERED" => {
            return string `Order #${orderId} has been delivered! Thank you for shopping with us.`;
        }
        "CANCELLED" => {
            return string `Order #${orderId} has been cancelled. Refund of $${totalAmount} will be processed.`;
        }
        _ => {
            return string `Order #${orderId} status updated to: ${status}`;
        }
    }
}