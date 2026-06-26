import ballerina/jwt;
import ballerina/http;
import ballerina/log;

configurable string asgardeoIssuer = ?;
configurable string asgardeoJwksUrl = ?;

// Reusable function to validate token from Authorization header
public function validateToken(http:Request req) returns jwt:Payload|http:Unauthorized {
    string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");

    if authHeader is http:HeaderNotFoundError {
        log:printWarn(" No Authorization header found");
        return http:UNAUTHORIZED;
    }

    if !authHeader.startsWith("Bearer ") {
        log:printWarn(" Invalid Authorization format");
        return http:UNAUTHORIZED;
    }

    string token = authHeader.substring(7);

    // Build config at call-time so configurable values are resolved
    jwt:ValidatorConfig validatorConfig = {
        issuer: asgardeoIssuer,
        audience: "nlsdG06f3CgFU1rclKeTaRgKzfAa",
        signatureConfig: {
            jwksConfig: {
                url: asgardeoJwksUrl
            }
        }
    };

    jwt:Payload|jwt:Error result = jwt:validate(token, validatorConfig);

    if result is jwt:Error {
        log:printWarn(" JWT validation failed: " + result.message());
        return http:UNAUTHORIZED;
    }

    log:printInfo("✅ Token validated for subject: " + (result.sub ?: "unknown"));
    return result;
}

// Check if user has admin role from token
public function isAdmin(jwt:Payload|http:Unauthorized authResult) returns boolean {
    if authResult is http:Unauthorized {
        return false;
    }

    // Check multiple possible claim URIs that Asgardeo might use
    string[] claimKeys = ["roles", "groups", "application_roles", "http://wso2.org/claims/role", "http://wso2.org/claims/groups"];
    
    foreach string key in claimKeys {
        any|error claimValue = authResult[key];
        if claimValue is string[] {
            foreach string role in claimValue {
                if role.toLowerAscii() == "admin" {
                    return true;
                }
            }
        } else if claimValue is anydata[] {
            foreach anydata role in claimValue {
                if role is string && role.toLowerAscii() == "admin" {
                    return true;
                }
            }
        } else if claimValue is string {
            if claimValue.toLowerAscii() == "admin" {
                return true;
            }
        }
    }
    return false;
}