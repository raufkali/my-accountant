import React, { useEffect, useState } from "react";

const Journal = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sells = await window.api.sells.getAll(); // fetch from preload
        // format the data for the table
        const formatted = sells.map((sell, idx) => ({
          id: idx + 1,
          buyer: sell.buyerName,
          seller: sell.sellerName,
          type: "Sell", // since we’re only fetching sells for now
          amount: sell.sellingRate * sell.totQuantity,
        }));
        setEntries(formatted);
      } catch (error) {
        console.error("Error fetching sells:", error);
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
            <th>Buyer</th>
            <th>Seller</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map((entry) => (
              <tr key={entry.id} className="text-center">
                <td>{entry.id}</td>
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
