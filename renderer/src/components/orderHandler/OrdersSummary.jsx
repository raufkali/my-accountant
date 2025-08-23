import React from "react";

const OrdersSummary = ({
  totPending,
  totComp,
  totalPendingQuantity,
  countPending,
  countCompleted,
}) => {
  return (
    <div className="row bg-light gap-3 rounded my-3 d-flex justify-content-center">
      <div className="card border-0 shadow-sm col-2 p-4">
        <div className="card-text text-center">
          <h6>Total Pending Orders:</h6>
          <h4 className="text-warning">{countPending}</h4>
        </div>
      </div>
      <div className="card border-0 shadow-sm col-2 p-4">
        <div className="card-text text-center">
          <h6>Total Pending Orders Quantity:</h6>
          <h4 className="text-warning">{totalPendingQuantity}</h4>
        </div>
      </div>
      <div className="card border-0 shadow-sm col-2 p-4">
        <div className="card-text text-center">
          <h6>Total Pending Orders Balance:</h6>
          <h4 className="text-warning">{totPending}</h4>
        </div>
      </div>

      <div className="card border-0 shadow-sm col-2 p-4">
        <div className="card-text text-center">
          <h6>Total Completed Orders:</h6>
          <h4 className="text-success">{countCompleted}</h4>
        </div>
      </div>

      <div className="card border-0 shadow-sm col-2 p-4">
        <div className="card-text text-center">
          <h6>Total Completed Orders Balance:</h6>
          <h4 className="text-success">{totComp}</h4>
        </div>
      </div>
    </div>
  );
};

export default OrdersSummary;
