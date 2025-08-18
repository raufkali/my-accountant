import React from "react";
import OrderCard from "./OrderCard";

const OrderList = ({ orders, onDelete, onCancel, onProceed }) => {
  return (
    <div className="card col-12 bg-light  border-0 p-3 mb-4">
      <div className="row text-center mb-3"></div>

      {["pending", "completed", "cancelled"].map((status) => (
        <div key={status}>
          <h4>All {status.charAt(0).toUpperCase() + status.slice(1)} Orders</h4>
          <div className="row mb-4 rounded-4 mt-2 p-3 bg-white">
            {orders
              .filter((o) => o.status === status)
              .map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onDelete={onDelete}
                  onCancel={onCancel}
                  onProceed={onProceed}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;
