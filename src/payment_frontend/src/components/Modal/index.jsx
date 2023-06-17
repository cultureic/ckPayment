import React, { useContext } from 'react';
import { ModalContext } from '../../index'; // replace with the actual path to your ModalContext

const Modal = () => {
  const { isOpen, closeModal } = useContext(ModalContext);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '1rem',
      zIndex: 1000,
    }}>
      <h1>This is a modal</h1>
      <button onClick={closeModal}>Close</button>
    </div>
  );
};

export default Modal;
