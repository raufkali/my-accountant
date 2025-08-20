import React, { useEffect, useState } from "react";

const Journal = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch all types
        const [sells, buys, sends, receives] = await Promise.all([
          window.api.sells.getAll(),
          window.api.buys.getAll(),
          window.api.sends.getAll(),
          window.api.receives.getAll(),
        ]);

        // normalize data into a common format
        let formatted = [];

        formatted = formatted.concat(
          sells.map((sell, idx) => ({
            id: `S-${idx + 1}`,
            buyer: sell.buyerName,
            seller: sell.sellerName,
            type: "Sell",
            amount: sell.sellingRate * sell.totQuantity,
          }))
        );

        formatted = formatted.concat(
          buys.map((buy, idx) => ({
            id: `B-${idx + 1}`,
            buyer: buy.buyerName,
            seller: buy.sellerName,
            type: "Buy",
            amount: buy.buyingRate * buy.totQuantity,
          }))
        );

        formatted = formatted.concat(
          sends.map((send, idx) => ({
            id: `SD-${idx + 1}`,
            buyer: send.receiverName,
            seller: send.senderName,
            type: "Send",
            amount: send.amount,
          }))
        );

        formatted = formatted.concat(
          receives.map((rec, idx) => ({
            id: `R-${idx + 1}`,
            buyer: rec.receiverName,
            seller: rec.senderName,
            type: "Receive",
            amount: rec.amount,
          }))
        );

        setEntries(formatted);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="journal container mt-4">
      <table className="table table-bordered table-hover">
        <thead>
          <tr className="table-dark text-center">
            <th>#</th>
            <th>Buyer / Receiver</th>
            <th>Seller / Sender</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map((entry, idx) => (
              <tr key={entry.id} className="text-center">
                <td>{idx + 1}</td>
                <td>{entry.buyer}</td>
                <td>{entry.seller}</td>
                <td>{entry.type}</td>
                <td>{entry.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No transactions yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Journal;
