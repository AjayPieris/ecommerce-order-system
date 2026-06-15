import ballerina/log;

public function main() returns error? {
    log:printInfo("Starting ecommerce backend...");
    log:printInfo("Product service running at http://localhost:9090/api/products");
}