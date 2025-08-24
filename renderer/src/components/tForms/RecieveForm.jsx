import React, { useState } from "react";

const RecieveForm = () => {
  const [form, setForm] = useState({
    receiverName: "",
    senderName: "",
    amount: "",
    product: "",
    date: "",
    note: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        product: Number(form.product),
      };
      await window.api.receives.create(payload);
      alert("Receive transaction created ✅");

      // Reset form
      setForm({
        receiverName: "",
        senderName: "",
        amount: "",
        product: "",
        date: "",
        note: "",
      });
    } catch (err) {
      console.error("Error creating receive transaction:", err);
      alert("Failed to create transaction ❌");
    }
  };

  return (
    <div className="recieve-form">
      <h3>Receiver Form</h3>
      <form onSubmit={handleSubmit} className="gap-2 row">
        <div className="col-12 d-flex gap-2">
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
            type="text"
            name="senderName"
            value={form.senderName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Sender name"
            required
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Total Amount"
          />
          <input
            type="number"
            name="product"
            value={form.product}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Dirhams"
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

        <div className="col-12 gap-2 d-flex">
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

export default RecieveForm;
