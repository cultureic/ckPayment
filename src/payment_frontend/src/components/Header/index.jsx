import React from 'react';
import "./index.css";
import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">BitFabric</h1>
            <nav className="app-nav">
                    <Link to="/docs">Docs</Link>
            </nav>
        </header>
    )
}


export default Header;
