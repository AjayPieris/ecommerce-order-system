import ballerina/log;

public function main() returns error? {
    log:printInfo("Ecommerce Backend Starting on port 9090...");
    log:printInfo("Product Service  → http://localhost:9090/api/products");
}