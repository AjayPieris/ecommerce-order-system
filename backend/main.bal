import ballerina/http as _;
import ballerina/log;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

// Config variables
configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbName = ?;
configurable string dbUser = ?;
configurable string dbPassword = ?;

// Shared DB client — used across all services
postgresql:Client dbClient = check new (
    host = dbHost,
    port = dbPort,
    database = dbName,
    username = dbUser,
    password = dbPassword,
    options = {
        ssl: {
            mode: postgresql:REQUIRE
        }
    }
);

public function main() returns error? {
    log:printInfo("Ecommerce Backend Starting...");
}