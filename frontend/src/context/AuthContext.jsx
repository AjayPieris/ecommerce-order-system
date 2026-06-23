import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import axios from "axios";

const AppAuthContext = createContext(null);

export const AppAuthProvider = ({ children }) => {
  const {
    state,
    signIn,
    signOut,
    getAccessToken,
    getDecodedIDToken,
    getBasicUserInfo,
    getIDToken,
  } = useAuthContext();

  // Sign up: calls signIn() which redirects to Asgardeo login page.
  // When self-registration is enabled in Asgardeo console, the login page
  // automatically shows a "Create an account" / "Register" link at the bottom.
  const signUp = () => signIn();

  const [userRole, setUserRole] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.isAuthenticated) {
      initializeUser();
    } else {
      setLoading(false);
    }
  }, [state.isAuthenticated]);

  const initializeUser = async () => {
    try {
      // Get decoded token to extract role
      const idToken = await getDecodedIDToken();
      const basicUserInfo = await getBasicUserInfo();
      setUserInfo(basicUserInfo || {});
      
      console.log("ID Token:", idToken);
      console.log("Basic User Info:", basicUserInfo);

      // Log full token to debug claim structure
      console.log("Full ID Token claims:", JSON.stringify(idToken, null, 2));

      // Asgardeo returns roles/groups under various claim URIs depending on config
      const rolesClaim =
        idToken?.roles ||
        idToken?.groups ||
        idToken?.application_roles ||
        idToken?.["http://wso2.org/claims/role"] ||
        idToken?.["http://wso2.org/claims/roles"] ||
        idToken?.["http://wso2.org/claims/groups"] ||
        idToken?.[`${import.meta.env.VITE_ASGARDEO_BASE_URL}/roles`] ||
        basicUserInfo?.roles ||
        basicUserInfo?.groups ||
        basicUserInfo?.application_roles ||
        basicUserInfo?.["http://wso2.org/claims/role"] ||
        basicUserInfo?.["http://wso2.org/claims/roles"] ||
        basicUserInfo?.["http://wso2.org/claims/groups"];

      const rolesArray = Array.isArray(rolesClaim)
        ? rolesClaim.map(r => typeof r === 'object' ? (r.display || r.name || r.value || JSON.stringify(r)) : String(r))
        : typeof rolesClaim === 'string'
        ? rolesClaim.split(',')
        : [];

      console.log("Detected roles:", rolesArray);
      const isAdmin = rolesArray.some(r => r.trim().toLowerCase().includes("admin"));

      setUserRole(isAdmin ? "admin" : "customer");

      // Only register non-admin users as customers
      if (!isAdmin) {
        await registerCustomer(idToken);
      }

    } catch (error) {
      console.error("Error initializing user:", error);
    } finally {
      setLoading(false);
    }
  };

  const registerCustomer = async (idToken) => {
    try {
      // We also update this to use getIDToken() to prevent 401s on customer endpoints
      const token = await getIDToken().catch(() => getAccessToken());
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL.includes("localhost") ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '').replace(/:9090$/, '') + '/api/customers' : 'http://localhost:9092/api/customers'}`,
        {
          asgardeo_user_id: idToken.sub,
          email: idToken.email || state.username,
          full_name: idToken.name || "Customer",
          phone: "",
          address: "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomerId(response.data.id);
      console.log("Customer registered:", response.data);
    } catch (error) {
      console.error("Customer registration error:", error);
    }
  };

  const getAuthHeader = async () => {
    // Send ID token because Asgardeo issues opaque access tokens by default,
    // which our backend cannot validate as a JWT.
    try {
      const token = await getIDToken();
      return { Authorization: `Bearer ${token}` };
    } catch (e) {
      const token = await getAccessToken();
      return { Authorization: `Bearer ${token}` };
    }
  };

  return (
    <AppAuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading || loading,
        user: { ...state, ...userInfo },
        userRole,
        customerId,
        signIn,
        signUp,
        signOut,
        getAuthHeader,
      }}
    >
      {children}
    </AppAuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AppAuthContext);