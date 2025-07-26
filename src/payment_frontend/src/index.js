import React, { createContext, useState, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from "./auth";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Docs from "./pages/Docs";
import Dashboard from "./pages/Dashboard";
import Modal from "./components/Modal";
import "./index.css";


// Create a new context for the modal
export const ModalContext = createContext();

// Create a provider for the modal context
const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <ModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
          <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
      </Router>
      <Modal />
    </div>
  );
};


const container = document.getElementById('app');
const root = createRoot(container);

root.render(
  <AuthProvider>
    <ModalProvider>
      <App />
    </ModalProvider>
  </AuthProvider>
);
