import React, { useEffect, useState } from "react";
import "./Accounts.css";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // ✅ preload uses window.api.accounts.getAll()
        const data = await window.api.accounts.getAll();
        setAccounts(data);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="main-content pe-4 pt-4 bg-light">
      <div className="row account-container bg-light gap-4 d-flex flex-column align-items-center">
        {accounts && accounts.length > 0 ? (
          accounts.map((acc) => (
            <div
              className="card account-card border-0 col-11 shadow-sm p-4"
              key={acc._id}
            >
              <h3 className="card-brand fw-bold">{acc.name} Account</h3>
              <h5 className={acc.balance > 0 ? "text-success" : "text-danger"}>
                Total Balance: {acc.balance ?? 0}
              </h5>

              {/* ✅ Transactions grouped by type */}
              {acc.transactions?.sendTransactions?.length > 0 && (
                <>
                  <h4>Send Transactions</h4>
                  <TransactionTable
                    headers={["#", "Receiver", "Amount"]}
                    data={acc.transactions.sendTransactions}
                  />
                </>
              )}

              {acc.transactions?.sellTransactions?.length > 0 && (
                <>
                  <h4>Sell Transactions</h4>
                  <TransactionTable
                    headers={["#", "Buyer", "Amount"]}
                    data={acc.transactions.sellTransactions}
                  />
                </>
              )}

              {acc.transactions?.receiverTransactions?.length > 0 && (
                <>
                  <h4>Receiver Transactions</h4>
                  <TransactionTable
                    headers={["#", "Sender", "Amount"]}
                    data={acc.transactions.receiverTransactions}
                  />
                </>
              )}

              {acc.transactions?.buyTransactions?.length > 0 && (
                <>
                  <h4>Buy Transactions</h4>
                  <TransactionTable
                    headers={["#", "Seller", "Amount"]}
                    data={acc.transactions.buyTransactions}
                  />
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-muted text-center ">No accounts found.</p>
        )}
      </div>
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
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Accounts;
