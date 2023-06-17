import React from 'react';
import "./index.css";

function Header() {
    return (
        <header className="app-header">
            <h1 className="app-title">Our Dfinity Solution</h1>
            <nav className="app-nav">
                <a href="#features">Features</a>
                <a href="#testimonials">Testimonials</a>
                <a href="#cta">Get Started</a>
            </nav>
        </header>
    )
}


export default Header;
