import React, { useEffect, useState } from "react";
import SellForm from "./tForms/SellForm";
import BuyForm from "./tForms/BuyForm";
import SendForm from "./tForms/SendForm";
import RecieveForm from "./tForms/RecieveForm";
import Journal from "./Journal";

const Transactions = () => {
  const [type, setType] = useState("");
  const [reloadJournal, setReloadJournal] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user._id) {
      setUserId(user._id);
    }
  }, []);

  const handleReload = () => {
    // Toggle state to force Journal reload
    setReloadJournal((prev) => !prev);
  };

  return (
    <div className="main-content py-4 pe-4 text-center">
      <div className="row bg-light p-4 mb-5">
        <div className="col-12 card shadow-sm p-4 border-0 bg-white d-flex justify-content-center align-items-center">
          <h4>Create New Transaction</h4>

          <select
            className="form-select shadow-sm bg-white w-25 text-center my-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Type</option>
            <option value="sell">Sell</option>
            <option value="buy">Buy</option>
            <option value="send">Send</option>
            <option value="recieve">Recieve</option>
          </select>

          <div className="row">
            <div className="col-12">
              {type === "sell" && (
                <SellForm userId={userId} onSubmit={handleReload} />
              )}
            </div>
            <div className="col-12">
              {type === "buy" && (
                <BuyForm userId={userId} onSubmit={handleReload} />
              )}
            </div>
            <div className="col-12">
              {type === "send" && (
                <SendForm userId={userId} onSubmit={handleReload} />
              )}
            </div>
            <div className="col-12">
              {type === "recieve" && (
                <RecieveForm userId={userId} onSubmit={handleReload} />
              )}
            </div>
          </div>
        </div>

        <div className="p-4 shadow-sm mt-4 bg-white border-2">
          <h3 className="mb-3">All Transactions</h3>
          <Journal userId={userId} reload={reloadJournal} />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
