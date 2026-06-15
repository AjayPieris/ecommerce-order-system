import ballerina/http;
import ballerina/log;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;
import ballerina/sql;

// ─── Types ───────────────────────────────────────────────

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

// ─── Notification Service ─────────────────────────────────

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true
    }
}
service /api/notifications on new http:Listener(9093) {

    // POST /api/notifications — create notification log
    resource function post .(NewNotification newNotif) returns Notification|error {
        log:printInfo("Creating notification for order: " + newNotif.order_id.toString());

        sql:ParameterizedQuery query = `INSERT INTO notifications
                                        (order_id, type, message)
                                        VALUES (${newNotif.order_id},
                                        ${newNotif.'type}, ${newNotif.message})
                                        RETURNING id, order_id, type,
                                        message, sent_at::text as sent_at`;

        Notification result = check dbClient->queryRow(query);
        log:printInfo("✅ Notification logged: #" + result.id.toString());
        return result;
    }

    // POST /api/notifications/order-status — send order status notification
    resource function post order\-status(OrderStatusNotification notif) 
                                         returns http:Ok|error {
        log:printInfo("📧 Sending order status notification...");
        log:printInfo("   Order    #" + notif.order_id.toString());
        log:printInfo("   Status → " + notif.status);
        log:printInfo("   Email  → " + notif.customer_email);

        // Build message based on status
        string message = buildStatusMessage(
            notif.order_id,
            notif.status,
            notif.total_amount
        );

        // Log to database
        sql:ParameterizedQuery query = `INSERT INTO notifications
                                        (order_id, type, message)
                                        VALUES (${notif.order_id}, 'EMAIL', ${message})`;
        _ = check dbClient->execute(query);

        // In real world → send actual email via SMTP or SendGrid
        // For now → just log it
        log:printInfo("📧 Email notification sent to: " + notif.customer_email);
        log:printInfo("📧 Message: " + message);

        return http:OK;
    }

    // GET /api/notifications — get all notifications (admin)
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

    // GET /api/notifications/order/[orderId] — get notifications for an order
    resource function get order/[int orderId]() returns Notification[]|error {
        log:printInfo("Fetching notifications for order: " + orderId.toString());

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

// ─── Helper Functions ─────────────────────────────────────

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