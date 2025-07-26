import React, { useEffect, useState } from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

function Header({ login }) {
  const [principal, setPrincipal] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, logout, backendActor } = useAuth();

  useEffect(() => {
    isAuthenticated ? handleWhoami() : null;
  }, [isAuthenticated]);

  const handleWhoami = async () => {
    let principal = await backendActor.whoami();
    console.log("handleing whoami", principal);

   // setPrincipal(principal);
  };
  const handleLogin = async () => {
    await login();
    navigate("/dashboard");
  };
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  console.log("principal", principal);
  return (
    <header className="app-header">
      <h1 className="app-title">BitFabric</h1>
      <nav className="app-nav">
        {isAuthenticated ? (
          <span onClick={handleLogout}>
            {principal}
            {"Logout"}
          </span>
        ) : (
          <Link onClick={handleLogin}>Connect</Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
