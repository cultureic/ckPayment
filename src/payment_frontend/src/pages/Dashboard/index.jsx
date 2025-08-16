const ProfileForm = ({profileData}) => {
  const [profile, setProfile] = useState({
    profilePicture: profileData.profilePicture,
    name: profileData.name,
    description: profileData.description,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitted Profile:", profile);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setProfile({ ...profile, profilePicture: file });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="input-group">
        <label className="label" htmlFor="name">
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={profile.name}
          onChange={handleInputChange}
          className="input-field"
          required
        />
      </div>
      <div className="input-group">
        <label className="label" htmlFor="description">
          Description:
        </label>
        <textarea
          id="description"
          name="description"
          value={profile.description}
          onChange={handleInputChange}
          className="textarea-field"
          required
        />
      </div>
      <div className="input-group file-field">
        <label className="label" htmlFor="profilePicture">
          Profile Picture:
        </label>
        <input
          type="file"
          id="profilePicture"
          name="profilePicture"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <button type="submit" className="submit-btn">
        Submit
      </button>
    </form>
  );
};

function StoreProfile({principal}) {
  const [createaStore, setCreateAStore] = useState(false);
  const { backendActor, ckBtcActor } = useAuth();
  const [ckPaymentWhoami, setWhoami] = useState(null);
  const [whoamisub, setWhoamiSub] = useState(null);
  const[profile, setProfile] = useState(null);
  const[defaultProfilePic,setDefaultProfilePic] = useState(null);


  const handleCanCreateStore = async () => {
    let canCreate = await backendActor.canCreateStore();
    let canisterWhoami = await backendActor.bitFabricCanister();
    let whoami = await backendActor.whoamisub();
    console.log("whaatt",canCreate,canisterWhoami,whoami)
    setCreateAStore(canCreate);
    setWhoami(canisterWhoami);
    setWhoamiSub(whoami);
    setButton(true);
  };





  const handleCreateAStore = async () => {
    console.log("in handle create a store", ckPaymentWhoami, whoamisub);
    let account = {
      owner: Principal.fromText(ckPaymentWhoami),
      subaccount: [whoamisub], // Pass the extracted array as the subaccount
    };

    let transerBalance = Number(26350);
    // @ts-ignore
    let transferResult = await ckBtcActor.icrc1_transfer({
      fee: [],
      amount: transerBalance,
      memo: [],
      from_subaccount: [],
      to: account,
      created_at_time: [],
    });
    console.log("transferResult", transferResult);
    if (transferResult && transferResult.Ok) {
        let defaultPro = {name:"my store",description:"this is my first store",profilePicture:[]};
        let newPro = await backendActor.addNewProfile(defaultPro);
        if(newPro  ** newPro.Ok){
            setProfile(newPro.Ok)
        }
    }
  };

  const handleWithdraw = async () =>{
        let withdraw = await backendActor.withdraw();
        console.log("withdraw",withdraw)
  }


  const handleGetProfile = async () =>{
    console.log("getting profile function",principal)
    let gettinProfile = await backendActor.getProfile(Principal.fromText(principal))
    console.log("gettin profile response",gettinProfile)
    if(gettinProfile && gettinProfile.ok){
        console.log("setting profile")
        setProfile(gettinProfile.ok)
        return
    }
  }

  useEffect(() => {
    if (principal) {
        handleGetProfile();
    }else{

    }
  }, [principal]);

  useEffect(()=>{},[profile])

  return (
    <div className="app-dashboard">
      <h2>Store Profile</h2>
      {createaStore ? (
        <div>
          {(
            <>
              <button onClick={handleCreateAStore}>Create a Store</button>
              <p>for just 26500 ckBTC</p>
            </>
          )}
        </div>
      ) : (
        profile ? <ProfileForm profileData={profile} /> : null
      )}
    </div>
  );
}

function Items() {
  return (
    <div className="app-dashboard">
      <h2>Items</h2>
      <p>This is where you can manage your store items.</p>
    </div>
  );
}

function Modal({ children, closeModal }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>
          X
        </button>
        {children}
      </div>
    </div>
  );
}

// Wallet component
function Wallet({ principal, balance, setBalance }) {
  const [showModal, setShowModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const { ckBtcActor } = useAuth();

  const handleTransfer = async () => {
    // Perform transfer action here using recipient value
    console.log("Transfer initiated to:", recipient);
    let account = { owner: Principal.fromText(recipient), subaccount: [] };
    let transerBalance = Number(balance) - 10;
    let trasnferResult = await ckBtcActor.icrc1_transfer({
      fee: [],
      amount: transerBalance,
      memo: [],
      from_subaccount: [],
      to: account,
      created_at_time: [],
    });
    // Add logic for transfer action
    console.log("transfer Result", trasnferResult);
    setBalance("00.00");
    setShowModal(false); // Close modal after transfer initiated
  };

  return (
    <div className="app-dashboard">
      <h2>Wallet</h2>
      <h3>{principal ? principal : null}</h3>
      <p> ckBTC. {balance}</p>
      <button onClick={() => setShowModal(true)}>Transfer</button>
      {showModal && (
        <Modal closeModal={() => setShowModal(false)}>
          <h2>Transfer Funds</h2>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient Address"
          />
          <button onClick={handleTransfer}>Transfer</button>
        </Modal>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import BubbleWidget from "../../components/BubbleWidget";
import Header from "../../components/Header";
import Factory from "../../components/Factory";
import "./index.css";
import { useAuth } from "../../auth";
let defaultProfilePic = "../../../assets/btc_station.png"
import { useNavigate } from "react-router-dom";
import { Principal } from "@dfinity/principal";

function Dahsboard() {
  const [activeTab, setActiveTab] = useState("store-profile");
  const navigate = useNavigate();
  const { ckBtcActor, backendActor, isAuthenticated } = useAuth();
  const [principal, setPrincipal] = useState(null);
  const [balance, setBalance] = useState("00.000");
  const whoamiasync = async () => {
    console.log("in whoami")
    let whoami = await backendActor.whoami();
    console.log("principal before set whoami", whoami);
    setPrincipal(whoami);
  };
  const ckBTCBalance = async () => {
    console.log("principal before balance", principal);
    let principalAccount = Principal.fromText(principal);
    let balance = await ckBtcActor.icrc1_balance_of({
      owner: principalAccount,
      subaccount: [],
    });
    console.log("balance", balance);
    let newBalance = Number(balance).toString();
    setBalance(newBalance);
  };
  useEffect(() => {
    if (!principal) {
      whoamiasync();
    } else {
      ckBTCBalance();
    }
  }, [principal]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="">
      <Header />
      <nav className="dashboard-tabs">
        <h1
          onClick={() => handleTabClick("store-profile")}
          className={activeTab === "store-profile" ? "active" : ""}
        >
          <span role="img" aria-label="Store Profile">
            🏪
          </span>{" "}
          Store Profile
        </h1>
        <h1
          onClick={() => handleTabClick("items")}
          className={activeTab === "items" ? "active" : ""}
        >
          <span role="img" aria-label="Items">
            🛍️
          </span>{" "}
          Items
        </h1>
        <h1
          onClick={() => handleTabClick("wallet")}
          className={activeTab === "wallet" ? "active" : ""}
        >
          <span role="img" aria-label="Wallet">
            💰
          </span>{" "}
          Wallet
        </h1>
        <h1
          onClick={() => handleTabClick("factory")}
          className={activeTab === "factory" ? "active" : ""}
        >
          <span role="img" aria-label="Factory">
            🏭
          </span>{" "}
          Factory
        </h1>
      </nav>
      <section>
        {activeTab === "store-profile" && <StoreProfile principal={principal} />}
        {activeTab === "items" && <Items />}
        {activeTab === "wallet" && (
          <Wallet
            balance={balance}
            principal={principal}
            setBalance={setBalance}
          />
        )}
        {activeTab === "factory" && <Factory />}
      </section>
      <BubbleWidget />
    </div>
  );
}

export default Dahsboard;
