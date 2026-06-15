import ballerina/log;

public function main() returns error? {
    log:printInfo("Starting ecommerce backend...");
    log:printInfo("Product service running at http://localhost:9090/api/products");
    log:printInfo("Order Service running at http://localhost:9091/api/orders");
    log:printInfo("Customer Service running at http://localhost:9092/api/customers");
}