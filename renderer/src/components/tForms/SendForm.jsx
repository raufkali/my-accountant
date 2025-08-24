import React, { useState } from "react";

const SendForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    senderName: "",
    receiverName: "",
    amount: "",
    product: "",
    date: "",
    note: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        product: Number(form.product),
      };

      await window.api.sends.create(payload);
      ("Send transaction created ✅");

      // reset
      setForm({
        senderName: "",
        receiverName: "",
        amount: "",
        product: "",
        date: "",
        note: "",
      });
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Error creating send transaction:", err);
    }
  };

  return (
    <div className="send-form  gap-2">
      <h3>Sender Form</h3>
      <form onSubmit={handleSubmit} className=" row">
        <div className="col-12 d-flex gap-2">
          <input
            type="text"
            name="senderName"
            value={form.senderName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Sender name"
            required
          />
          <input
            type="text"
            name="receiverName"
            value={form.receiverName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Receiver name"
            required
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Total Amount"
            required
          />
          <input
            type="number"
            name="product"
            value={form.product}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Dirhams"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="col-12 gap-2 d-flex mt-2">
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Description"
          />
          <button className="btn btn-dark" type="submit">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendForm;
