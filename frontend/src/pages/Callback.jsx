import { useEffect } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const { state } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate("/");
    }
  }, [state.isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl font-semibold text-gray-600 animate-pulse">
        Signing you in...
      </div>
    </div>
  );
}