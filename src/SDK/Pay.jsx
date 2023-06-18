import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styled,{css} from "styled-components";
import { AuthProvider, useAuth } from "./auth";
import { addItem,addProfile } from "./interfaceHook";






const SVGLogo = ({ address, loading }) => {
  useEffect(() => {}, [address]);

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 999,
          }}
        >
          <div className="spinner" />
        </div>
      )}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="400"
        height="240"
        style={{ filter: loading ? 'blur(5px)' : 'drop-shadow(2px 2px 1px rgba(0,0,0,0.1))' }}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#F7931A', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#F7931A', stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>
        <rect width="400" height="240" rx="20" fill="url(#grad1)" />

        {/* Card Background */}
        <rect x="20" y="40" width="360" height="160" rx="16" fill="#fff" />

        {/* Shiny Gradient Overlay */}
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.6)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect x="20" y="40" width="360" height="160" rx="16" fill="url(#grad2)" />

        {/* Card Details */}
        <text x="40" y="120" fill="#4D4D4D" fontSize="24">
          {address}
        </text>
        <text x="40" y="160" fill="#4D4D4D" fontSize="20">
          Card Holder
        </text>
        <text x="280" y="220" fill="#4D4D4D" fontSize="20">
          BTC
        </text>
        <rect x="40" y="50" width="60" height="40" fill="#4D4D4D" />
        <line x1="40" y1="70" x2="100" y2="70" style={{ stroke: '#F7931A', strokeWidth: 2 }} />
        <line x1="40" y1="80" x2="100" y2="80" style={{ stroke: '#F7931A', strokeWidth: 2 }} />
        <text x="40" y="200" fill="#4D4D4D" fontSize="20">
          Exp: 12/24
        </text>
      </svg>
    </div>
  );
};




const SVGPlaceholder = ({ data }) => {
  useEffect(()=>{

  },[data])

  const ITEM_HEIGHT = 20; // Height for each item row
  const PADDING = 10; // Padding around the SVG
  const FONT_SIZE = 14; // Font size for text

  const items = data && data.map((item, index) => (
    <g key={index} transform={`translate(0, ${(index * ITEM_HEIGHT) + (PADDING * 2)})`}>
      <text x={PADDING} y={ITEM_HEIGHT} fontSize={FONT_SIZE}>{item.item}</text>
      <text x={PADDING * 4} y={ITEM_HEIGHT} fontSize={FONT_SIZE}>{item.price}</text>
    </g>
  ));

  const totalHeight = (data && data.length * ITEM_HEIGHT) + (PADDING * 4);
  const totalWidth = PADDING * 6;

  return (
    <svg width={totalWidth} height={totalHeight} xmlns="http://www.w3.org/2000/svg">
      <rect width={totalWidth - PADDING} height={totalHeight - PADDING} x={PADDING / 2} y={PADDING / 2} fill="none" stroke="black" strokeWidth="2" />
      {items}
      <line x1={PADDING / 2} y1={totalHeight - (ITEM_HEIGHT + PADDING)} x2={totalWidth - (PADDING / 2)} y2={totalHeight - (ITEM_HEIGHT + PADDING)} stroke="black" strokeWidth="2" />
      <text x={PADDING} y={totalHeight - PADDING} fontSize={FONT_SIZE}>Total</text>
      <text x={PADDING * 4} y={totalHeight - PADDING} fontSize={FONT_SIZE}>{data && data.reduce((total, item) => total + parseFloat(item.price.replace('$', '')), 0).toFixed(2)}</text>
    </svg>
  );
};




const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 20px;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
`;


const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  min-width:40%;
  min-height:45%;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    min-width:30%;
  }
`;

const PayButton = styled.button`
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;



const PaymentComponent = ({ onPayment, style, classes, logo, removePaymentModal,data }) => {
  const { isAuthenticated, identity, login, backendActor, logout } = useAuth();
  const [mssg, setMssg] = useState(null);
  const [step, setStep] = useState(0);


  useEffect(()=>{
    getMessage();
  },[isAuthenticated,backendActor])

  useEffect(() => {
    if (!mssg) {
      getMessage();
    }
  }, [mssg, backendActor, identity,isAuthenticated]);

  const getMessage = async () => {
    if (backendActor) {
      let response = await backendActor.mintBTC();
      console.log("address to mint BTC",response)
      if (response) {
        setMssg(response.ok);
      }
    }
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  return (
    <ModalWrapper className={classes.modalWrapper} style={style.modalWrapper}>
      <ModalContent className={classes.modalContent} style={style.modalContent}>
        <CloseButton onClick={removePaymentModal}>X</CloseButton>
        <SVGLogo address={mssg} loading={true} />
        {step === 0 && <Login handleNextStep={handleNextStep} data={data} isAuthenticated={isAuthenticated} login={login} logout={logout} />}
        {step === 1 && <SelectPaymentMethod handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} data={data} />}
        {step === 2 && <ConfirmPaymentDetails handleNextStep={handleNextStep} handlePreviousStep={handlePreviousStep} data={data} />}
        {step === 3 && <ProcessPayment handleNextStep={handleNextStep} data={data} />}
        {step === 4 && <PaymentSuccess />}
         </ModalContent>
    </ModalWrapper>
  );
  }


  const Login = ({ handleNextStep, removePaymentModal,data,isAuthenticated,login,logout }) => {
    return (
      <div>
        {!!!isAuthenticated && <h2 onClick={async ()=>{await login()}}>Login</h2>}
        {!!isAuthenticated && <h2 onClick={async ()=>{await logout()}}>Logout</h2>}

        <ButtonContainer>
          <CancelButton onClick={removePaymentModal}>Cancel</CancelButton>
          <button onClick={handleNextStep}>Next</button>
        </ButtonContainer>
      </div>
    );
  };

  const SelectPaymentMethod = ({ handleNextStep, handlePreviousStep, removePaymentModal,data }) => {
    return (
      <div>
        <h2>Select Payment Method</h2>
        <SVGPlaceholder data={data} />
        <ButtonContainer>
          <CancelButton onClick={removePaymentModal}>Cancel</CancelButton>
          <div>
            <button onClick={handlePreviousStep}>Back</button>
            <button onClick={handleNextStep}>Next</button>
          </div>
        </ButtonContainer>
      </div>
    );
  };

  const ConfirmPaymentDetails = ({ handleNextStep, handlePreviousStep, removePaymentModal, data }) => {
    return (
      <div>
        <h2>Confirm Payment Details</h2>
        <SVGPlaceholder data={data} />
        <ButtonContainer>
          <CancelButton onClick={removePaymentModal}>Cancel</CancelButton>
          <div>
            <button onClick={handlePreviousStep}>Back</button>
            <button onClick={handleNextStep}>Next</button>
          </div>
        </ButtonContainer>
      </div>
    );
  };

  const ProcessPayment = ({ handleNextStep, removePaymentModal,data }) => {
    return (
      <div>
        <h2>Process Payment</h2>
        <SVGPlaceholder data={data} />
        <ButtonContainer>
          <CancelButton onClick={removePaymentModal}>Cancel</CancelButton>
          <button onClick={handleNextStep}>Next</button>
        </ButtonContainer>
      </div>
    );
  };

let modalContainer = null;

const MyLibrary = {
  initialize: (containerId) => {
    modalContainer = document.getElementById(containerId);
    if (!modalContainer) {
      throw new Error("Could not find container element");
    }
  },
  renderPaymentModal: (props, onPayment) => {
    if (!modalContainer) {
      throw new Error(
        "You must initialize MyLibrary with a container element before rendering the modal"
      );
    }





    const defaultProps = {
      style: {},
      classes: {},
      logo: SVGLogo,
    };
    props = { ...defaultProps, ...props };

    ReactDOM.render(
      <AuthProvider>
       <PaymentComponent {...props} onPayment={onPayment} removePaymentModal={MyLibrary.removePaymentModal} data={[
      { item: "Item 1", price: "$10.00" },
      { item: "Item 2", price: "$20.00" }
    ]} />
      </AuthProvider>,
      modalContainer
    );
  },
  removePaymentModal: () => {
    if (!modalContainer) {
      throw new Error(
        "You must initialize MyLibrary with a container element before removing the modal"
      );
    }

    ReactDOM.unmountComponentAtNode(modalContainer);
  },
  addItem,
  addProfile
};

export default MyLibrary;
