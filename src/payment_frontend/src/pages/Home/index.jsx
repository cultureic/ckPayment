import React, { useEffect, useState } from 'react';
import './index.css';
import Phone from "../../components/phone"
import Form from "../../components/Form"
import BTC_State from "../../../assets/btc_station.png"
import BubbleWidget from '../../components/BubbleWidget';
import Header from '../../components/Header';
import {useAuth} from "../../auth";
import { Link } from "react-router-dom";
//import Chat from "../../components/chat";



 






function Home() {
    const{login,isAuthenticated} = useAuth();
   

    return (
        <>
        <div className="app">
            <Header login ={login}/>
            <section className="app-hero">
                <h2>Welcome to the Future of Ecommerce 💰</h2>
                <p>Fast, secure, and built on the revolutionary Dfinity blockchain. 🔒</p>
               {isAuthenticated?  <Link to="/dashboard">Dashboard ➡️</Link>:null}
            </section>
            <Phone/>
  
  <section style={{display:"flex",flexDirection:"row"}}>
    <img className="my-image" src={BTC_State} alt="Bitcoin State" />
  </section>
        </div>
     <BubbleWidget/>
</>
    );
}

export default Home;
