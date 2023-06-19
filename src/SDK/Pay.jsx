import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import styled,{css,keyframes} from "styled-components";
import { AuthProvider, useAuth } from "./auth";
import { addItem,addProfile,getItem,buyItem } from "./interfaceHook";









const SVGLogo = ({ address, loading }) => {
  useEffect(() => {}, [address]);

  const textRef = useRef(null);

  const getFontSize = (address) => {
    let baseSize = 18;
    if (address) {
      if (address.length > 20) {
        baseSize = 14;
      } else if (address.length > 30) {
        baseSize = 12;
      } else if (address.length > 40) {
        baseSize = 10;
      }
      return baseSize;
    }
  };

  const handleCopyClick = () => {
    if (textRef.current) {
      textRef.current.select();
      document.execCommand('copy');
      textRef.current.blur();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '85%',
        height: '0',
        paddingBottom: '56.25%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMid meet"
        style={{
          opacity: loading ? 0.5 : 1,
          filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          minHeight: '100%',
          minWidth: '100%',
        }}
      >
        {/* Card Background */}
        <defs>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: cardColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: gradientColor, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect x="10" y="0" width="380" height="205" rx="16" fill="url(#cardGrad)" />

        {/* Shiny Gradient Overlay */}
        <defs>
          <radialGradient id="shineGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.6)', stopOpacity: 0 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0)', stopOpacity: 1 }} />
          </radialGradient>
        </defs>
        <rect x="10" y="0" width="380" height="205" rx="16" fill="url(#shineGrad)" />

        {/* Card Details */}
        <foreignObject x="30" y="85" width="340" height="60">
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <input
              ref={textRef}
              type="text"
              value={address}
              style={{ margin: 0, fontSize: address && getFontSize(address), width: '100%', border: 'none', background: 'transparent', outline: 'none', color: '#4D4D4D' }}
              readOnly
            />
          </div>
        </foreignObject>
        <text x="30" y="155" fill="#4D4D4D" fontSize="14">
          Card Holder
        </text>
        <text x="320" y="185" fill="#4D4D4D" fontSize="14">
          {balance && balance} BTC
        </text>
        <image x="30" y="25" width="60" height="30" src="https://www.pngfind.com/pngs/m/29-299072_bitcoin-logo-png-bitcoin-logo-black-and-white.png" />
        <text x="30" y="180" fill="#4D4D4D" fontSize="14">
          Exp: 12/24
        </text>
      </svg>
      {address && (
          <button
            onClick={handleCopyClick}
            style={{
              position: 'absolute',
              bottom: '80px',  // Adjust this to position above the BTC balance
              right: '10px', // Align to the right
              display: 'flex', // Display icon and text in a row
              alignItems: 'center', // Center vertically
              padding: '5px', // Reduce padding to make button smaller
              background: 'transparent',
              border: 'none',
              color: '#4D4D4D',
              cursor: 'pointer',
              fontSize: '9.1px', // Make the button text 1.3x larger
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '2.5px', width: '15.6px', height: '15.6px' }}  // Make SVG 1.3x larger
            >
              <path d="M4 12H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-2M7 7H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M7 7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2M7 7v4h4" />
            </svg>
            Copy Address
          </button>
        )}

    </div>
  );
};







const DynamicContent = ({ data }) => {
  const elementComponents = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    img: 'img',
    section: 'section',
    nav: 'nav',
    ul: 'ul',
    li: 'li',
    // Add other elements here...
  };
  // Recursive function to create elements from data
  const createElement = (data) => {
    const { type, props, children, style } = data;
    const ElementComponent = elementComponents[type];

    if (!ElementComponent) {
      console.warn(`No component defined for type "${type}"`);
      return null;
    }

    const allProps = { ...props, style };  // Merge styles with other props

    return React.createElement(
      ElementComponent,
      allProps,
      Array.isArray(children) ? children.map(createElement) : children
    );
  };


  return <>{createElement(data)}</>;
};

const StepContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
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
  padding: 10px;
  flex-direction: column;
  // Media query for mobile devices
  @media (max-width: 768px) {
    width: 95%;
  }
`;

const ModalContent = styled.div`
  background: ${props => props.secondaryColor || "white"};
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;

  @media (max-width: 768px) {
    width: 95%;
  }
`;


const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  align-self:end;
`;

const ButtonContainer = styled.div`
  justify-content: space-between;
  margin-top: 20px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  background: ${props => props.primaryColor || "#007bff"};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin: 10px;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;


// Rest of your code...

const CancelButton = styled(Button)`
  background: #dc3545;
`;

const PayButton = styled(Button)`
  background: #007bff;
`;






const StepsComponent = ({ login,steps, componentMapping,removePaymentModal,logout, setBalance, ...props }) => {
  const { isAuthenticated } = useAuth(); // get the isAuthenticated value from useAuth
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = !!steps && steps[currentStepIndex];

  // Function to advance to next step
  const advanceStep = () => {
    setCurrentStepIndex(prevIndex => prevIndex + 1);
  };

  // Function to retreat to previous step, unless the current step is login
  const retreatStep = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentStep.type === 'login') {
      advanceStep();
    }
  }, [isAuthenticated, currentStep.type]);

  const handleNextStep = () => setCurrentStepIndex(prevIndex => prevIndex + 1);
  const handlePreviousStep = () => setCurrentStepIndex(prevIndex => prevIndex - 1);

  if(!currentStep){
    return null;
  }

  return (
    <StepContentContainer title={currentStep.title}>
      <CustomStep
        isAuthenticated={isAuthenticated}
        step={currentStep}
        handleNextStep={handleNextStep}
        handlePreviousStep={handlePreviousStep}
        componentMapping={componentMapping}
        removePaymentModal={removePaymentModal}
        login={login}
        logout={logout}
        setBalance={setBalance}
        {...props}
      />
    </StepContentContainer>
  );
};








const PaymentComponent = ({ steps, styles = {}, classes, logo, removePaymentModal, onPayment, componentMapping, secondaryColor,primaryColor,gradientColor,cardColor, ...props }) => {
  const { isAuthenticated, identity, login, backendActor, logout } = useAuth();
  const [mssg, setMssg] = useState(null);
  const [balance, setBalance] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading,setLoading] = useState(false);

  const handleStepChange = (step) => {
    setCurrentStep(step);
  }

  useEffect(()=>{
    getMessage();
  },[isAuthenticated, backendActor])

  useEffect(() => {
    if (!mssg) {
      getMessage();
    }
  }, [mssg, backendActor, identity,isAuthenticated]);

  const getMessage = async () => {
    if (backendActor) {
      setLoading(true)
      let response = await backendActor.mintBTC();
      let balance =  await backendActor.getBalance();
      console.log("address to mint BTC",response)
      console.log("balance",Number(balance))
      if (response && Number(balance) != null) {
        setMssg(response.ok);
        setBalance(Number(balance))
        setLoading(false)
      }
    }
  };

  const defaultModalWrapperStyles = `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(128, 128, 128, 0.7); /* semi-transparent gray */
  border-radius: 5px;
  backdrop-filter: blur(5px)
  // Media query for mobile devices
  @media (max-width: 600px) {
    width: 95%;
  }
  ;

  `; // Default CSS string for modal wrapper styles

  const defaultModalContentStyles = `
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #000;

  // Media query for mobile devices
  @media (max-width: 768px) {
    width: 95%;
  }
`; // Default CSS string for modal content styles

const StyledSVGLogo = styled(SVGLogo)`
  max-width: 80%; // Or any other size you think fits well.
  max-height: 80%; // Or any other size you think fits well.
`;




const DynamicModalContent = styled(ModalContent)(css`${styles.modalContent || defaultModalContentStyles}`);
const DynamicModalWrapper = styled(ModalWrapper)(css`${styles.modalWrapper || defaultModalWrapperStyles}`);

  return (
    <DynamicModalWrapper className={classes.modalWrapper} secondaryColor={secondaryColor}>
            <DynamicModalContent className={classes.modalContent} secondaryColor={secondaryColor}>
              <CloseButton onClick={()=>removePaymentModal}/>
            <StyledSVGLogo balance={balance} address={mssg} loading={loading} cardColor={cardColor} gradientColor={gradientColor} />
              <StepsComponent setBalance={setBalance} login={login} steps={steps} componentMapping={componentMapping} primaryColor={primaryColor} secondaryColor={secondaryColor} {...props} removePaymentModal={removePaymentModal} logout={logout} />
            </DynamicModalContent>
        </DynamicModalWrapper>

  );
};



  const Login = ({ handleNextStep, removePaymentModal,data,isAuthenticated,login,logout }) => {
    return (
      <StepContentContainer style={{width:"100%"}}>
        {!!!isAuthenticated && <h2 style={{padding:"5px"}} onClick={async ()=>{await login()}}>Login</h2>}
        {!!isAuthenticated && <h2 onClick={async ()=>{await logout()}}>Logout</h2>}
        <DynamicContent data={data} />
        <ButtonContainer>
        { !!isAuthenticated && <button onClick={handleNextStep}>Next</button>}
        </ButtonContainer>
      </StepContentContainer>
    );
  };

  const SelectPaymentMethod = ({ handleNextStep, handlePreviousStep, removePaymentModal,data }) => {
    return (
      <StepContentContainer>
        <h2>Select Payment Method</h2>
        <DynamicContent data={data} />
        <ButtonContainer>
          <CancelButton onClick={removePaymentModal}>Cancel</CancelButton>
          <div>
            <button onClick={handleNextStep}>Next</button>
          </div>
        </ButtonContainer>
      </StepContentContainer>
    );
  };

  const ConfirmPaymentDetails = ({ handleNextStep, handlePreviousStep, removePaymentModal, data }) => {
    return (
      <StepContentContainer>
        {isConfirmed ? confirmationMessage : paymentDetails}
        <ButtonContainer>
          <div>
            <button onClick={handlePreviousStep}>Back</button>
            <button onClick={handleNextStep}>Next</button>
          </div>
        </ButtonContainer>
      </StepContentContainer>
    );
  };


  const ProcessPayment = ({ handleNextStep, removePaymentModal,data }) => {
    return (
      <StepContentContainer>
        <h2>Process Payment</h2>
        <DynamicContent data={data} />
        <ButtonContainer>
          <CancelButton onClick={removePaymentModal}>Cancel</CancelButton>
          <button onClick={handleNextStep}>Next</button>
        </ButtonContainer>
      </StepContentContainer>
    );
  };

let modalContainer = null;

let options = {}; // Options will be set during initialization

const MyLibrary = {
  initialize: (containerId, opts) => {
    modalContainer = document.getElementById(containerId);

    if (!modalContainer) {
      throw new Error("Could not find container element");
    }
    options = opts; // Set options
  },
  renderPaymentModal: (props, onPayment) => {
    if (!modalContainer) {
      throw new Error(
        "You must initialize MyLibrary with a container element before rendering the modal"
      );
    }

    const componentMapping = {
      login: Login,
      selectPaymentMethod: SelectPaymentMethod,
      confirmPaymentDetails: ConfirmPaymentDetails,
      processPayment: ProcessPayment,
    };

    const defaultProps = {
      style: {},
      classes: {},
      logo: SVGLogo,
      steps:[
        {
          type: 'login',
          title: 'Login',
          data:{}
        },
        {
          type: 'confirmPaymentDetails',
          title: 'ConfirmPaymentDetails',
          data: {}
        }
      ]
    };

    // Merge defaultProps, props, and options
    props = { ...defaultProps, ...props, ...options };

    // if steps and data are passed in options, they should override the defaults
    if (options.steps) {
      props.steps = options.steps;
    }

    ReactDOM.render(
      <AuthProvider>
        <PaymentComponent {...props} onPayment={onPayment} removePaymentModal={MyLibrary.removePaymentModal} data={[
          { item: "Item 1", price: "$10.00" },
          { item: "Item 2", price: "$20.00" }
        ]}
        componentMapping={componentMapping}
        />
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
  addProfile,
  buyItem,
  getItem
};

export default MyLibrary;
