import React from "react";

const OrderCard = ({ order, onDelete, onCancel, onProceed }) => {
  const statusStyles = {
    pending: { bg: "warning", border: "border-warning", text: "text-warning" },
    completed: {
      bg: "success",
      border: "border-success",
      text: "text-success",
    },
    cancelled: { bg: "danger", border: "border-danger", text: "text-danger" },
  };

  const style = statusStyles[order.status] || statusStyles.pending;

  return (
    <div className="col-4 mb-3">
      <div
        className={`card bg-${style.bg}-light shadow-sm rounded-4 overflow-hidden border bg-white border-2 ${style.border}`}
      >
        <div
          className={`row bg-${style.bg} m-0 justify-content-end align-items-center`}
        >
          <div className="col text-center">
            <h6 className="text-white">{order.status}</h6>
          </div>
          <div className="col-2">
            <button
              className="rounded-3 btn btn-danger"
              onClick={() => onDelete(order._id)}
            >
              X
            </button>
          </div>
        </div>
        <div className="row p-2">
          <h5 className={`card-title ${style.text}`}>
            Ordered By {order.orderBy}
          </h5>
          <h5 className={`card-title ${style.text}`}>
            Ordered To {order.orderTo}
          </h5>
          <div className="card-body">
            <h6>Ordered Quantity: {order.quantity} Dirham</h6>
            <h6>Selling Rate: {order.rate} PKR</h6>
            <h6 className="fw-bold">
              Ordered Amount: {order.rate * order.quantity} PKR
            </h6>

            {order.status === "completed" && (
              <>
                <h6>Received Quantity: {order.completionQuantity} Dirham</h6>
                <h6>Receiving Rate: {order.completionRate} PKR</h6>
                <h6 className="fw-bold text-success">
                  Paid Amount: {order.completionAmount} PKR
                </h6>
                {order.pay === "yes" ? (
                  <h6 className="bg-success p-1 text-white text-center rounded-5">
                    PAID
                  </h6>
                ) : (
                  <h6 className="bg-danger p-1 text-white text-center rounded-5">
                    UNPAID
                  </h6>
                )}
              </>
            )}
          </div>
          {order.status === "pending" && (
            <div className="row">
              <div className="col-6">
                <button
                  className="btn btn-danger w-100"
                  onClick={() => onCancel(order._id)}
                >
                  Cancel
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn btn-success w-100"
                  onClick={() => onProceed(order._id)}
                >
                  Proceed
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
