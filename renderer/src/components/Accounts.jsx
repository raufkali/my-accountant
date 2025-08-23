import React, { useEffect, useState } from "react";
import "./Accounts.css";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: 0,
    product: 0,
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await window.api.accounts.getAll();
        setAccounts(data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount({ ...newAccount, [name]: value });
  };

  const handleSaveAccount = async () => {
    try {
      const accountToSave = {
        ...newAccount,
        name: newAccount.name.toLowerCase(), // lowercase names
      };
      const created = await window.api.accounts.create(accountToSave);
      setAccounts([...accounts, created]);
      setShowModal(false);
      setNewAccount({ name: "", balance: 0, product: 0 });
    } catch (err) {
      console.error("Error creating account:", err);
    }
  };

  return (
    <div className="main-content pe-4 pt-4 bg-light">
      {/* ✅ Add Button */}
      <div className="d-flex justify-content-end mb-3 me-4">
        <button className="btn btn-dark" onClick={() => setShowModal(true)}>
          + Add Account
        </button>
      </div>

      <div className="row account-container bg-light gap-4 d-flex flex-column align-items-center">
        {accounts && accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              className="card account-card border-0 col-11 shadow-sm p-4"
              key={acc._id}
            >
              <h3 className="card-brand fw-bold">{acc.name} Account</h3>
              <h5 className={acc.balance >= 0 ? "text-success" : "text-danger"}>
                Total Balance: {acc.balance ?? 0}
              </h5>
              <h5 className={acc.product >= 0 ? "text-success" : "text-danger"}>
                Total Products: {acc.product ?? 0}
              </h5>

              {/* ✅ Transactions Sections */}
              {acc.transactions?.sendTransactions?.length > 0 && (
                <>
                  <h4>Send Transactions</h4>
                  <TransactionTable
                    headers={["#", "Receiver", "Amount", "Date", "Note"]}
                    data={acc.transactions.sendTransactions}
                  />
                </>
              )}

              {acc.transactions?.sellTransactions?.length > 0 && (
                <>
                  <h4>Sell Transactions</h4>
                  <TransactionTable
                    headers={["#", "Buyer", "Amount", "Date", "Note"]}
                    data={acc.transactions.sellTransactions}
                  />
                </>
              )}

              {acc.transactions?.receiverTransactions?.length > 0 && (
                <>
                  <h4>Receiver Transactions</h4>
                  <TransactionTable
                    headers={["#", "Sender", "Amount", "Date", "Note"]}
                    data={acc.transactions.receiverTransactions}
                  />
                </>
              )}

              {acc.transactions?.buyTransactions?.length > 0 && (
                <>
                  <h4>Buy Transactions</h4>
                  <TransactionTable
                    headers={["#", "Seller", "Amount", "Date", "Note"]}
                    data={acc.transactions.buyTransactions}
                  />
                </>
              )}

              {/* ✅ Debitors & Creditors */}
              {acc.debitors?.length > 0 && (
                <>
                  <h4>Debitors</h4>
                  <TransactionTable
                    headers={["#", "Name", "Amount", "Date", "Note"]}
                    data={acc.debitors}
                  />
                </>
              )}

              {acc.creditors?.length > 0 && (
                <>
                  <h4>Creditors</h4>
                  <TransactionTable
                    headers={["#", "Name", "Amount", "Date", "Note"]}
                    data={acc.creditors}
                  />
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted text-center">No accounts found.</p>
        )}
      </div>

      {/* ✅ Bootstrap Modal */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Account Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={newAccount.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Balance</label>
                  <input
                    type="number"
                    className="form-control"
                    name="balance"
                    value={newAccount.balance}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Products</label>
                  <input
                    type="number"
                    className="form-control"
                    name="product"
                    value={newAccount.product}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={handleSaveAccount}
                >
                  Save Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Reusable Table Component
const TransactionTable = ({ headers, data }) => {
  return (
    <table className="table text-center border">
      <thead className="table-dark">
        <tr>
          {headers.map((h, idx) => (
            <th key={idx}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((txn, idx) => (
          <tr key={txn._id || idx}>
            <td>{idx + 1}</td>
            <td>{txn.name}</td>
            <td>{txn.amount}</td>
            <td>{new Date(txn.date).toLocaleDateString()}</td>
            <td>{txn.note || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Accounts;
