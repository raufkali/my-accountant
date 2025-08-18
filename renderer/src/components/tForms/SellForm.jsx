import React, { useState } from "react";
const SellForm = () => {
  let [paymentStatus, setPaymentStatus] = useState("");
  let [totDebtors, setTotDebtors] = useState("");
  return (
    <div className="sell-form">
      <h4>Selling Form</h4>
      <form>
        <div class="row gap-2">
          {/* first row */}
          <div class="col-12 d-flex gap-2">
            <input
              type="text"
              placeholder="Enter Seller name"
              className="form-control text-center"
            />
            <input
              type="text"
              placeholder="Enter Buyer name"
              className="form-control text-center"
            />
            <input
              type="number"
              placeholder="Enter Selling Rate"
              className="form-control text-center"
            />
            <input
              type="number"
              placeholder="Enter total Quantity"
              className="form-control text-center"
            />
          </div>
          {/* second row */}

          <div class="col-12 d-flex gap-2">
            <input type="date" className="form-control rounded text-center" />

            <select
              class="form-select text-center"
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                if (e.target.value == "payToDebtor") {
                  setTotDebtors();
                } else {
                  setTotDebtors();
                }
              }}
            >
              <option defaulted>Paying Method</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Un Paid</option>
              <option value="payToDebtor">Pay to Debtor</option>
            </select>
            {paymentStatus === "payToDebtor" && (
              <input
                type="number"
                placeholder="Enter number of Debtors"
                className="form-control text-center"
                onChange={(e) => {
                  setTotDebtors(e.target.value);
                }}
              />
            )}
          </div>
          {/* third Row */}
          {totDebtors && (
            <div class=" p-4 rounded mx-auto border border-2 border-dark my-2 d-flex gap-2 flex-column">
              {Array.from({ length: totDebtors }, (_, i) => (
                <>
                  <h5>Enter Debtor {i + 1} Record</h5>
                  <div class="col-12 d-flex gap-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter debtor name"
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter Amount"
                    />
                    
                  </div>
                </>
              ))}
            </div>
          )}
          {/* fourth Row */}
          <div class="col-12 d-flex gap-2">
            <input
              type="text"
              placeholder="Enter Description"
              className="form-control"
            />
            <button type="submit" className="btn btn-dark">
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellForm;
