import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const Journal = ({ reload }) => {
  const [entries, setEntries] = useState([]);
  const [expandedNotes, setExpandedNotes] = useState({}); // track expanded state

  const fetchData = async () => {
    try {
      const [sells, buys, sends, receives] = await Promise.all([
        window.api.sells.getAll(),
        window.api.buys.getAll(),
        window.api.sends.getAll(),
        window.api.receives.getAll(),
      ]);

      let formatted = [];

      // Sell transactions
      sells.forEach((sell) => {
        const totalAmount = sell.sellingRate * sell.totQuantity;
        const productCount = sell.totQuantity;
        const debtorsInfo =
          sell.debtors?.map((d) => `${d.name}: ${d.amount}`).join(", ") || "-";

        formatted.push({
          id: `S-${sell._id}`,
          dbId: sell._id,
          typeName: "Sell",
          buyer: sell.buyerName,
          seller: sell.sellerName,
          amount: totalAmount,
          products: productCount,
          debtors: debtorsInfo,
          note: sell.note || "-",
        });
      });

      // Buy transactions
      buys.forEach((buy) => {
        const totalAmount = buy.buyingRate * buy.totQuantity;
        const productCount = buy.totQuantity;
        formatted.push({
          id: `B-${buy._id}`,
          dbId: buy._id,
          typeName: "Buy",
          buyer: buy.buyerName,
          seller: buy.sellerName,
          amount: totalAmount,
          products: productCount,
          debtors: "-",
          note: buy.note || "-",
        });
      });

      // Send transactions
      sends.forEach((send) => {
        formatted.push({
          id: `SD-${send._id}`,
          dbId: send._id,
          typeName: "Send",
          buyer: send.receiverName,
          seller: send.senderName,
          amount: send.amount,
          products: send.product,
          debtors: "-",
          note: send.note || "-",
        });
      });

      // Receive transactions
      receives.forEach((rec) => {
        formatted.push({
          id: `R-${rec._id}`,
          dbId: rec._id,
          typeName: "Receive",
          buyer: rec.receiverName,
          seller: rec.senderName,
          amount: rec.amount,
          products: rec.product,
          debtors: "-",
          note: rec.note || "-",
        });
      });

      setEntries(formatted);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reload]);

  const handleDelete = async (entry) => {
    try {
      let confirmDelete = window.confirm(
        `Are you sure you want to delete this ${entry.typeName} transaction?`
      );
      if (!confirmDelete) return;

      switch (entry.typeName) {
        case "Sell":
          await window.api.sells.delete(entry.dbId);
          break;
        case "Buy":
          await window.api.buys.delete(entry.dbId);
          break;
        case "Send":
          await window.api.sends.delete(entry.dbId);
          break;
        case "Receive":
          await window.api.receives.delete(entry.dbId);
          break;
        default:
          console.warn("Unknown transaction type:", entry.typeName);
      }

      fetchData();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert("Failed to delete transaction ❌");
    }
  };

  const toggleNote = (id) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
            <th>Action</th>
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
                  <td>{entry.typeName}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.products}</td>
                  <td>{entry.debtors}</td>
                  <td className="d-flex justify-content-center gap-1">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(entry)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                    {entry.note && entry.note !== "-" && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleNote(entry.id)}
                        title="Toggle Note"
                      >
                        <FontAwesomeIcon
                          icon={
                            expandedNotes[entry.id]
                              ? faChevronUp
                              : faChevronDown
                          }
                        />
                      </button>
                    )}
                  </td>
                </tr>

                {/* Note / Description row */}
                {expandedNotes[entry.id] &&
                  entry.note &&
                  entry.note !== "-" && (
                    <tr className="text-center">
                      <td
                        colSpan="8"
                        className="text-center fst-italic text-muted"
                      >
                        {entry.note}
                      </td>
                    </tr>
                  )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
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
