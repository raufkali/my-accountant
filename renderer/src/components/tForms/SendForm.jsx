import React from "react";

const SendForm = () => {
  return (
    <div className="send-form row gap-2">
      <h3>Sender Form</h3>
      <div class="col-12 d-flex gap-2">
        <input
          type="text"
          class="form-control"
          placeholder="Enter Sender name"
        />
        <input
          type="text"
          class="form-control"
          placeholder="Enter Reciever name"
        />
        <input
          type="number"
          class="form-control"
          placeholder="Enter Total Amount"
        />
        <input type="date" className="form-control" />
      </div>
      <div class="col-12 gap-2 d-flex">
        <input
          type="text"
          class="form-control"
          placeholder="Enter Description"
        />
        <button className="btn btn-dark" type="submit">
          Create
        </button>
      </div>
    </div>
  );
};

export default SendForm;
