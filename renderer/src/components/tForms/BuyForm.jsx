import React, { useState } from "react";

const BuyForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    buyerName: "",
    sellerName: "",
    buyingRate: "",
    totQuantity: "",
    date: "",
    payingMethod: "",
    note: "",
  });

  const [totDebtors, setTotDebtors] = useState(0);
  const [debtors, setDebtors] = useState([]);

  // handle main form fields
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // handle debtor fields
  const handleDebtorChange = (index, field, value) => {
    const updated = [...debtors];
    updated[index] = { ...updated[index], [field]: value };
    setDebtors(updated);
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        buyingRate: Number(form.buyingRate),
        totQuantity: Number(form.totQuantity),
        debtors: form.payingMethod === "payToDebtor" ? debtors : [],
      };

      await window.api.buys.create(payload); // call backend
      alert("Buy transaction created ✅");

      // reset form
      setForm({
        buyerName: "",
        sellerName: "",
        buyingRate: "",
        totQuantity: "",
        date: "",
        payingMethod: "",
        note: "",
      });
      setTotDebtors(0);
      setDebtors([]);

      // notify parent to reload Journal
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Error creating buy transaction:", err);
      alert("Failed to create transaction ❌");
    }
  };

  return (
    <div className="buy-form">
      <h4>Buying Form</h4>
      <form onSubmit={handleSubmit}>
        <div className="row gap-2">
          {/* Main Inputs */}
          <div className="col-12 d-flex gap-2">
            <input
              type="text"
              name="buyerName"
              value={form.buyerName}
              onChange={handleChange}
              placeholder="Enter Buyer name"
              className="form-control text-center"
              required
            />
            <input
              type="text"
              name="sellerName"
              value={form.sellerName}
              onChange={handleChange}
              placeholder="Enter Seller name"
              className="form-control text-center"
              required
            />
            <input
              type="number"
              name="buyingRate"
              value={form.buyingRate}
              onChange={handleChange}
              placeholder="Enter Buying Rate"
              className="form-control text-center"
              required
            />
            <input
              type="number"
              name="totQuantity"
              value={form.totQuantity}
              onChange={handleChange}
              placeholder="Enter total Quantity"
              className="form-control text-center"
              required
            />
          </div>

          {/* Date and Paying Method */}
          <div className="col-12 d-flex gap-2">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="form-control rounded text-center"
            />

            <select
              name="payingMethod"
              value={form.payingMethod}
              className="form-select text-center"
              onChange={(e) => {
                handleChange(e);
                const method = e.target.value;
                if (method === "payToDebtor") {
                  setTotDebtors(1);
                  setDebtors([{ name: "", amount: "" }]);
                } else {
                  setTotDebtors(0);
                  setDebtors([]);
                }
              }}
              required
            >
              <option value="">Paying Method</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Un Paid</option>
              <option value="payToDebtor">Pay to Debtor</option>
            </select>

            {/* Number of Debtors */}
            {form.payingMethod === "payToDebtor" && (
              <input
                type="number"
                value={totDebtors}
                min={1}
                placeholder="Number of Debtors"
                className="form-control text-center"
                onChange={(e) => {
                  const count = Number(e.target.value);
                  setTotDebtors(count);
                  setDebtors(
                    Array.from(
                      { length: count },
                      (_, i) => debtors[i] || { name: "", amount: "" }
                    )
                  );
                }}
              />
            )}
          </div>

          {/* Debtors Section */}
          {form.payingMethod === "payToDebtor" && totDebtors > 0 && (
            <div className="p-4 rounded mx-auto border border-2 border-dark my-2 d-flex gap-2 flex-column">
              {debtors.map((debtor, i) => (
                <div key={i} className="col-12 d-flex gap-2 align-items-center">
                  <h6 className="m-0">Debtor {i + 1}</h6>
                  <input
                    type="text"
                    value={debtor.name}
                    onChange={(e) =>
                      handleDebtorChange(i, "name", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter debtor name"
                    required
                  />
                  <input
                    type="number"
                    value={debtor.amount}
                    onChange={(e) =>
                      handleDebtorChange(i, "amount", e.target.value)
                    }
                    className="form-control"
                    placeholder="Enter Amount"
                    required
                  />
                </div>
              ))}
            </div>
          )}

          {/* Note and Submit */}
          <div className="col-12 d-flex gap-2">
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
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
