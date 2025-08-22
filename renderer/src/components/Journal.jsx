import React, { useEffect, useState } from "react";

const Journal = ({ reload }) => {
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

        let formatted = [];

        // Sell transactions
        sells.forEach((sell, idx) => {
          const totalAmount = sell.sellingRate * sell.totQuantity;
          const productCount = sell.totQuantity;
          const debtorsInfo =
            sell.debtors?.map((d) => `${d.name}: ${d.amount}`).join(", ") ||
            "-";

          formatted.push({
            id: `S-${idx + 1}`,
            buyer: sell.buyerName,
            seller: sell.sellerName,
            type: "Sell",
            amount: totalAmount,
            products: productCount,
            debtors: debtorsInfo,
            note: sell.note || "-", // ✅ include note
          });
        });

        // Buy transactions
        buys.forEach((buy, idx) => {
          const totalAmount = buy.buyingRate * buy.totQuantity;
          const productCount = buy.totQuantity;

          formatted.push({
            id: `B-${idx + 1}`,
            buyer: buy.buyerName,
            seller: buy.sellerName,
            type: "Buy",
            amount: totalAmount,
            products: productCount,
            debtors: "-", // typically not applicable
            note: buy.note || "-",
          });
        });

        // Send transactions
        sends.forEach((send, idx) => {
          formatted.push({
            id: `SD-${idx + 1}`,
            buyer: send.receiverName,
            seller: send.senderName,
            type: "Send",
            amount: send.amount,
            products: "-", // not applicable
            debtors: "-",
            note: send.note || "-",
          });
        });

        // Receive transactions
        receives.forEach((rec, idx) => {
          formatted.push({
            id: `R-${idx + 1}`,
            buyer: rec.receiverName,
            seller: rec.senderName,
            type: "Receive",
            amount: rec.amount,
            products: "-", // not applicable
            debtors: "-",
            note: rec.note || "-",
          });
        });

        setEntries(formatted);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchData();
  }, onchange);

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
            <th>Products</th>
            <th>Debtors</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? (
            entries.map((entry, idx) => (
              <React.Fragment key={entry.id}>
                {/* Main transaction row */}
                <tr className="text-center">
                  <td>{idx + 1}</td>
                  <td>{entry.buyer}</td>
                  <td>{entry.seller}</td>
                  <td>{entry.type}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.products}</td>
                  <td>{entry.debtors}</td>
                </tr>

                {/* Note / Description row */}
                {entry.note && entry.note !== "-" && (
                  <tr className="text-center">
                    <td colSpan="7" className="text-center">
                      {entry.note}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
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
