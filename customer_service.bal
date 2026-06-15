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