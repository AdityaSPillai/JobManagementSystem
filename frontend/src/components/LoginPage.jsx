import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal.jsx";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleOnLogin = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "white" }}>
      <LoginModal isOpen={true} onClose={() => {}} onLogin={handleOnLogin} />
    </div>
  );
}