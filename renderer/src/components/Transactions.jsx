import React, { useState } from "react";
import SellForm from "./tForms/SellForm";
import BuyForm from "./tForms/BuyForm";
import SendForm from "./tForms/SendForm";
import RecieveForm from "./tForms/RecieveForm";
import Journal from "./Journal";

const Transactions = () => {
  let [type, setType] = useState("");
  return (
    <div className="main-content py-4 pe-4 text-center">
      <div class="row bg-light p-4 mb-5">
        <div class="col-12 card shadow-sm p-4 border-0 bg-white d-flex justify-content-center align-items-center">
          <h4>Create New Transaction</h4>
          <select
            class="form-select shadow-sm bg-white w-25 text-center my-2 "
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option defaultValue="Select Type">Select Type</option>
            <option value="sell">Sell</option>
            <option value="buy">Buy</option>
            <option value="send">Send</option>
            <option value="recieve">Recieve</option>
          </select>
          <div class="row">
            <div class="col-12">{type === "sell" && <SellForm />}</div>
            <div class="col-12">{type === "buy" && <BuyForm />}</div>
            <div class="col-12">{type === "send" && <SendForm />}</div>
            <div class="col-12">{type === "recieve" && <RecieveForm />}</div>
          </div>
        </div>
        <div class=" p-4 shadow-sm mt-4 bg-white border-2 ">
          <h3 className="mb-3">All Transactions</h3>
          <Journal />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
