import React, { useEffect, useState } from "react";
import "./Accounts.css";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await window.api.getAllAccounts();
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
        {accounts &&
          accounts.map((acc, accIndex) => (
            <div
              className="card account-card border-0 col-11 shadow-sm p-4"
              key={accIndex}
            >
              <h3 className="card-brand fw-bold">{acc.name} Account</h3>
              <h5 className={acc.balance > 0 ? "text-success" : "text-danger"}>
                Total Balance: {acc.balance}
              </h5>

              {/* Send Transactions */}
              {acc.transactions.sendTransactions?.length > 0 && (
                <>
                  <h4>Send Transactions</h4>
                  <table className="table text-center border">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Receiver</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acc.transactions.sendTransactions.map((txn, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{txn.name}</td>
                          <td>{txn.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Sell Transactions */}
              {acc.transactions.sellTransactions?.length > 0 && (
                <>
                  <h4>Sell Transactions</h4>
                  <table className="table text-center border">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acc.transactions.sellTransactions.map((txn, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{txn.name}</td>
                          <td>{txn.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Receiver Transactions */}
              {acc.transactions.receiverTransactions?.length > 0 && (
                <>
                  <h4>Receiver Transactions</h4>
                  <table className="table text-center border">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Sender</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acc.transactions.receiverTransactions.map((txn, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{txn.name}</td>
                          <td>{txn.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Buy Transactions */}
              {acc.transactions.buyTransactions?.length > 0 && (
                <>
                  <h4>Buy Transactions</h4>
                  <table className="table text-center border">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        <th>Seller</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acc.transactions.buyTransactions.map((txn, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{txn.name}</td>
                          <td>{txn.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Accounts;
