import React from "react";

const ProceedModal = ({
  proceedModalRef,
  modalInstanceRef,
  proceedData,
  handleProceedChange,
  handleProceedSubmit,
}) => {
  return (
    <div
      className="modal fade"
      id="proceedModal"
      tabIndex="-1"
      ref={proceedModalRef}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Proceed Order</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              onClick={() => modalInstanceRef.current?.hide()}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleProceedSubmit} className="row g-2">
              <div className="col-md-6">
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  className="form-control"
                  value={proceedData.quantity}
                  onChange={handleProceedChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  name="rate"
                  placeholder="Rate"
                  className="form-control"
                  value={proceedData.rate}
                  onChange={handleProceedChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="receiver"
                  placeholder="Receiver"
                  className="form-control"
                  value={proceedData.receiver}
                  onChange={handleProceedChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <select
                  name="pay"
                  className="form-select"
                  value={proceedData.pay}
                  onChange={handleProceedChange}
                  required
                >
                  <option value="">Paid?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="col-md-12">
                <input
                  type="text"
                  placeholder="Amount"
                  className="form-control"
                  value={String(proceedData.amount)}
                  readOnly
                />
              </div>
              <div className="col-md-12">
                <button type="submit" className="btn btn-success w-100">
                  Complete Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProceedModal;
