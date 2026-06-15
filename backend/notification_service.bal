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