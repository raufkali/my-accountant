import React, { useEffect, useState } from "react";
import "./Accounts.css";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
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
        name: newAccount.name.toLowerCase(),
      };
      const created = await window.api.accounts.create(accountToSave);
      setAccounts([...accounts, created]);
      setShowModal(false);
      setNewAccount({ name: "", balance: 0, product: 0 });
    } catch (err) {
      console.error("Error creating account:", err);
    }
  };

  const toggleSection = (accountId, section) => {
    const key = `${accountId}-${section}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

              {/* ✅ Transactions Sections with Toggler */}
              {acc.transactions?.sendTransactions?.length > 0 && (
                <SectionWithToggle
                  title="Send Transactions"
                  accountId={acc._id}
                  section="sendTransactions"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <TransactionTable
                    headers={[
                      "#",
                      "Receiver",
                      "Amount",
                      "Products",
                      "Date",
                      "Note",
                    ]}
                    data={acc.transactions.sendTransactions}
                  />
                </SectionWithToggle>
              )}

              {acc.transactions?.sellTransactions?.length > 0 && (
                <SectionWithToggle
                  title="Sell Transactions"
                  accountId={acc._id}
                  section="sellTransactions"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <TransactionTable
                    headers={[
                      "#",
                      "Buyer",
                      "Amount",
                      "Products",
                      "Date",
                      "Note",
                    ]}
                    data={acc.transactions.sellTransactions}
                  />
                </SectionWithToggle>
              )}

              {acc.transactions?.receiverTransactions?.length > 0 && (
                <SectionWithToggle
                  title="Receiver Transactions"
                  accountId={acc._id}
                  section="receiverTransactions"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <TransactionTable
                    headers={[
                      "#",
                      "Sender",
                      "Amount",
                      "Products",
                      "Date",
                      "Note",
                    ]}
                    data={acc.transactions.receiverTransactions}
                  />
                </SectionWithToggle>
              )}

              {acc.transactions?.buyTransactions?.length > 0 && (
                <SectionWithToggle
                  title="Buy Transactions"
                  accountId={acc._id}
                  section="buyTransactions"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <TransactionTable
                    headers={[
                      "#",
                      "Seller",
                      "Amount",
                      "Products",
                      "Date",
                      "Note",
                    ]}
                    data={acc.transactions.buyTransactions}
                  />
                </SectionWithToggle>
              )}

              {/* ✅ Debitors & Creditors */}
              {acc.debitors?.length > 0 && (
                <SectionWithToggle
                  title="Debitors"
                  accountId={acc._id}
                  section="debitors"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <TransactionTable
                    headers={[
                      "#",
                      "Name",
                      "Amount",
                      "Products",
                      "Date",
                      "Note",
                    ]}
                    data={acc.debitors}
                  />
                </SectionWithToggle>
              )}

              {acc.creditors?.length > 0 && (
                <SectionWithToggle
                  title="Creditors"
                  accountId={acc._id}
                  section="creditors"
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                >
                  <TransactionTable
                    headers={[
                      "#",
                      "Name",
                      "Amount",
                      "Products",
                      "Date",
                      "Note",
                    ]}
                    data={acc.creditors}
                  />
                </SectionWithToggle>
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

// ✅ Reusable Section with Toggle
const SectionWithToggle = ({
  title,
  accountId,
  section,
  expandedSections,
  toggleSection,
  children,
}) => {
  const key = `${accountId}-${section}`;
  const isExpanded = expandedSections[key];

  return (
    <div className="mt-3">
      <div
        className="d-flex justify-content-between align-items-center bg-light p-2 border rounded"
        style={{ cursor: "pointer" }}
        onClick={() => toggleSection(accountId, section)}
      >
        <h4 className="m-0">{title}</h4>
        <span>{isExpanded ? "−" : "+"}</span>
      </div>
      {isExpanded && <div className="mt-2">{children}</div>}
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
            <td>{txn.amount ?? 0}</td>
            <td>{txn.product ?? 0}</td>
            <td>{new Date(txn.date).toLocaleDateString()}</td>
            <td>{txn.note || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Accounts;
