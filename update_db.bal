import ballerina/io;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;
import ballerina/sql;

configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbName = ?;
configurable string dbUser = ?;
configurable string dbPassword = ?;

public function main() returns error? {
    postgresql:Client dbClient = check new (
        host = dbHost,
        port = dbPort,
        database = dbName,
        username = dbUser,
        password = dbPassword,
        options = {
            ssl: {mode: postgresql:REQUIRE}
        }
    );

    sql:ExecutionResult result = check dbClient->execute(`ALTER TABLE products ADD COLUMN actual_price DECIMAL(10,2)`);
    io:println("Added actual_price column successfully.");
    check dbClient.close();
}
