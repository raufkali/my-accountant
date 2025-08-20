import React, { useState } from "react";

const SendForm = () => {
  const [form, setForm] = useState({
    senderName: "",
    receiverName: "",
    amount: "",
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
      };

      await window.api.sends.create(payload);
      ("Send transaction created ✅");

      // reset
      setForm({
        senderName: "",
        receiverName: "",
        amount: "",
        date: "",
        note: "",
      });
    } catch (err) {
      console.error("Error creating send transaction:", err);
    }
  };

  return (
    <div className="send-form row gap-2">
      <h3>Sender Form</h3>
      <form onSubmit={handleSubmit} className="w-100">
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
