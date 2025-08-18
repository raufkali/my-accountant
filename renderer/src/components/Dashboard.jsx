import React from "react";
import Journal from "./Journal";

const Dashboard = () => {
  return (
    <div className="main-content bg-light">
      <div className="container pt-5">
        <div className="row gap-auto d-flex justify-content-center gap-5">
          <div className="col-3 card border-0  pt-3 shadow-sm text-center">
            <h5 className="text-danger fw-bold ">PURCHASED</h5>
            <h2 className="py-4">10000 PKR</h2>
          </div>
          <div className="col-3 card text-center pt-3 border-0 shadow-sm">
            <h5 className="text-success fw-bold">SOLD</h5>
            <h2 className="py-4">9000 PKR</h2>
          </div>
          <div className="col-3 card text-center pt-3 border-0 shadow-sm">
            <h5 className="fw-bold text-warning">PROFIT</h5>
            <h2 className="py-4">1000 PKR</h2>
          </div>
        </div>
        <div class="row d-flex justify-content-center">
          <div class="col-11 p-4 card mt-4 shadow-sm border-0">
            <h3>Recent Transactions</h3>
            <Journal />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
