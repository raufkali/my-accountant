import React from "react";

const BuyForm = () => {
  return (
    <div className="buy-form">
      <h4>Buying Form</h4>
      <form>
        <div class="row gap-2">
          <div class="col-12 d-flex gap-2">
            <input
              type="text"
              placeholder="Enter Buyer name"
              className="form-control text-center"
            />
            <input
              type="text"
              placeholder="Enter Seller name"
              className="form-control text-center"
            />
            <input
              type="number"
              placeholder="Enter Buying Rate"
              className="form-control text-center"
            />
            <input
              type="number"
              placeholder="Enter total Quantity"
              className="form-control text-center"
            />
          </div>

          <div class="col-12 d-flex gap-2">
            <input type="date" className="form-control rounded text-center" />

            <select class="form-select text-center">
              <option defaulted>Paying Method</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Un Paid</option>
              <option value="payToDebtor">Pay to Debtor</option>
            </select>
          </div>
          <div class="col-12 d-flex gap-2">
            <input
              type="text"
              placeholder="Enter Details"
              className="form-control text-center"
            />
            <button className="btn btn-dark" type="submit">
              Create
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BuyForm;
