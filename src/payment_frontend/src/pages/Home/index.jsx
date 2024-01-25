import React, { useEffect, useState } from 'react';
import './index.css';
import Phone from "../../components/phone"
import Form from "../../components/Form"
import BTC_State from "../../../assets/btc_station.png"
import BubbleWidget from '../../components/BubbleWidget';
import Header from '../../components/Header';
import {useAuth} from "../../auth";
//import Chat from "../../components/chat";



window.onload = function () {
    ckPaySDK.PaymentComponent.initialize('payment-modal', {
      "cardColor": "#123456",
      "gradientColor": "#789abc",
      "primaryColor": "#abcdef",
      "secondaryColor": "#ffffff",
      "steps": [
        {
          "type": "login",
          "title": "Custom Login",
          "data": {}
        },
        {
          "type": "selectPaymentMethod",
          "title": "Custom Select Payment Method",
          "data": {}
        }
      ]
    });
  }

  const styles = {
    section: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      color: '#343a40',
      width: '80%',
      margin: 'auto'
    },
    heading: {
      marginBottom: '20px',
    },
    paragraph: {
      marginBottom: '10px',
    },
  };

  const ProjectSection = () => (
    <section style={styles.section}>
      <h2 style={styles.heading}>Introducing Our Project: A Payment CDN on the Internet Computer</h2>
      <p style={styles.paragraph}>Our project is a revolutionary step forward in the world of decentralized applications (DApps) and Bitcoin machines. It's a payment content delivery network (CDN) hosted on the Internet Computer. We offer customizable widgets that can be easily integrated into your DApps.</p>
      <p style={styles.paragraph}>What sets our project apart is its unique ability to share the same session between your DApp and our CDN. This enables seamless transfer of ckBTC natively. We also allow you to create items in our DB, turning our widgets into an eCommerce accelerator on the Internet Computer Platform (ICP).</p>
      <h3 style={styles.heading}>Implementation</h3>
      <p style={styles.paragraph}>To implement our SDK in your web application, include the HTML markup where you want the payment modal to appear and add the JavaScript code provided in our documentation. Don't forget to replace the placeholder with your actual SDK file path.</p>
      <h3 style={styles.heading}>Customization</h3>
      <p style={styles.paragraph}>Our SDK is fully customizable to meet your application's needs. For detailed information on available configuration options and APIs, please refer to our SDK documentation.</p>
      <h3 style={styles.heading}>Integration</h3>
      <p style={styles.paragraph}>You can easily integrate our SDK into a basic HTML page or a React application. Just follow the steps provided in our documentation.</p>
      <h3 style={styles.heading}>Unique Advantage</h3>
      <p style={styles.paragraph}>Our project leverages the unique property of the ICP that assigns principal IDs based on domain. By adding our widget to your DApp, your users share the same principal ID in both your DApp and our DB. This creates a relationship between your DApp and our services while isolating other DApps.</p>
    </section>
  );


  function Options() {
    const [options, setOptions] = useState({
      cardColor: "#123456",
      gradientColor: "#789abc",
      primaryColor: '#abcdef',
      secondaryColor: '#ffffff',
      steps: [
        {
          type: 'login',
          title: 'Custom Login',
          data: { /* Custom data */ }
        },
        {
          type: 'selectPaymentMethod',
          title: 'Custom Select Payment Method',
          data: { /* Custom data */ }
        }
      ],
    });

    useEffect(() => {
      ckPaySDK.PaymentComponent.initialize('payment-modal', options);
    }, [options]);

    return (
      <div style={{width:"80%"}}>
        {/* ... */}
        <CodeEditor options={options} onOptionsChange={setOptions} />
        {/* ... */}
      </div>
    );
  }



  function CodeEditor({ options, onOptionsChange }) {
    const [text, setText] = useState(JSON.stringify(options, null, 2));

    useEffect(() => {
      setText(JSON.stringify(options, null, 2));
    }, [options]);

    const handleTextChange = (event) => {
      const newText = event.target.value;
      setText(newText);
      try {
        const newOptions = JSON.parse(newText);
        onOptionsChange(newOptions);
      } catch (error) {
        // You might want to handle this error differently,
        // e.g. by showing an error message to the user
        console.error('Failed to parse options:', error);
      }
    };

    return (
      <div style={{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",width:"100%"}} className="code-editor-container">
      <h2 className="code-editor-title">Configure your options:</h2>
      <textarea className="code-editor" value={text} onChange={handleTextChange} />
    </div>    );
  }


const formSchema = {
    title: "Item Registration",
    fields: [
      {
        name: "name",
        type: "text",
        required: true,
        validate: value => /^[a-zA-Z0-9\s]+$/.test(value), // Field must only contain alphanumeric characters and spaces
        validateMessage: "The name can only contain alphanumeric characters and spaces"
      },
      {
        name: "cost",
        type: "number",
        required: true,
        validate: value => value > 0, // Field must be greater than zero
        validateMessage: "Cost must be more than 0"
      },
      {
        name: "available",
        type: "checkbox",
        validate: () => true // Checkboxes don't need validation
      },
      {
        name: "category",
        type: "text",
        required: true,
        validate: value => /^[a-zA-Z\s]+$/.test(value), // Field must only contain alphabetic characters and spaces
        validateMessage: "The category can only contain alphabetic characters and spaces"
      },
      {
        name: "wallet",
        type: "button",
        category: "form",
        label: "Open Wallet",
        onClick: "handleWallet"
      },
      {
        name: "submit",
        type: "button",
        category: "submit",
        label: "Submit",
        onClick: "handleSubmit"
      },
      {
        name: "logout",
        type: "button",
        category: "form",
        label: "logout",
        onClick: "handleLogout"
      },
    ]
  };


function Home() {
    const{icEthActor,login,logout,backendActor,isAuthenticated,principal} = useAuth();
    const [isNavOpen, setIsNavOpen] = useState(false);

    const startPaymentFlow = async () => {
     //let response1= await ckPaySDK.PaymentComponent.addProfile();
      //let response = await ckPaySDK.PaymentComponent.addItem();
        ckPaySDK.PaymentComponent.renderPaymentModal({}, function () {
          console.log('Payment complete')
          // hide the modal when payment is done
          ckPaySDK.PaymentComponent.removePaymentModal()
        })
      }

    const grabEth = async () =>{
      let ethAddress=  await icEthActor.caller_eth_address()
      console.log("ethAddres",ethAddress)
    }


    useEffect(()=>{
        console.log("here",backendActor,isAuthenticated)
        if(icEthActor){
          grabEth()
        }
    },[isAuthenticated,backendActor,icEthActor])

    const handleNavToggle = () => {
        setIsNavOpen(!isNavOpen);
    }

    return (
        <>
        <div className="app">
            <Header/>
            <section className="app-hero">
                <h2>Welcome to the Future of Payments 💰</h2>
                <p>Fast, secure, and built on the revolutionary Dfinity blockchain. 🔒</p>
                <button onClick={()=>{startPaymentFlow()}}>Demo Payment Flow ➡️</button>
            </section>
            <Phone/>
            <section style={{display:"flex",justifyContent:"center",width:"100%"}}>
            <Options/>
            </section>
            <Form
            callbacks={{
                handleSubmit: async (event, item) => {
                    console.log("handleSubmit",backendActor)
                    if(backendActor){
                        item["merchant"]=principal;
                        item['cost']=Number(item['cost']);
                        console.log("item before submit",item)
                        let response = await backendActor.addNewItem(item);
                        console.log("look at response",response)
                    }
                 },
                handleWallet: async (event, item) => {
                    if(isAuthenticated){
                        await logout()
                    }else{
                        await login()
                    }
                 },
                 handleLogout: async (event, item) => {
                  if(isAuthenticated){
                      await logout()
                  }else{
                      await login()
                  }
               },

                // More callbacks as required
            }}
        formSchema={formSchema}
        loggedIn={isAuthenticated}
/>
  <section style={{display:"flex",flexDirection:"row"}}>
    <img className="my-image" src={BTC_State} alt="Bitcoin State" />
  </section>
        </div>
     <BubbleWidget/>
</>
    );
}

export default Home;
