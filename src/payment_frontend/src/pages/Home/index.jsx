import React, { useEffect, useState } from 'react';
import './index.css';
import Phone from "../../components/phone"
import Form from "../../components/Form"
import BTC_State from "../../../assets/btc_station.png"
import BubbleWidget from '../../components/BubbleWidget';
import Header from '../../components/Header';
import {useAuth} from "../../auth";
import ckPay from '../../../../../ckPay';



window.onload = function () {
    ckPaySDK.PaymentComponent.initialize('payment-modal')
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
      }
    ]
  };


function Home() {
    const{login,logout,backendActor,isAuthenticated,principal} = useAuth();
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


    useEffect(()=>{
        console.log("here",backendActor,isAuthenticated)
    },[isAuthenticated,backendActor])

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
            <section>
            <Phone/>
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
                // More callbacks as required
            }}
        formSchema={formSchema}
        loggedIn={isAuthenticated}
/>

 <img className="my-image" src={BTC_State} alt="Bitcoin State" />
        </div>
     <BubbleWidget/>
</>
    );
}

export default Home;
