import React from "react";

const CreateOrderForm = ({ newOrder, handleChange, handleAddOrder }) => {
  return (
    <div className="card shadow-sm border-0 p-3 mb-4">
      <h4 className="mb-3">Create Order</h4>
      <form onSubmit={handleAddOrder} className="row g-2">
        <div className="col-md-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="form-control"
            value={newOrder.name}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            name="rate"
            placeholder="Rate"
            className="form-control"
            value={newOrder.rate}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            className="form-control"
            value={newOrder.quantity}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-2">
          <button type="submit" className="btn btn-dark w-100">
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderForm;
