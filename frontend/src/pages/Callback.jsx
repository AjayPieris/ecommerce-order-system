import { useEffect, useState } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const { signIn, state } = useAuthContext();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // If already authenticated (e.g. fast redirect), go home immediately
    if (state.isAuthenticated) {
      navigate("/");
      return;
    }

    // Complete the OAuth token exchange using the code in the URL
    signIn()
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.error("Sign in callback error:", err);
        setError("Login failed. Please try again.");
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      <p className="text-gray-600 font-medium animate-pulse">Signing you in...</p>
    </div>
  );
}