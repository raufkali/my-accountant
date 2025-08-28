const Send = require("../models/SendTrx");
const Account = require("../models/Account");

async function getOrCreateAccount(name) {
  name = name.toLowerCase();
  let account = await Account.findOne({ name });
  if (!account) {
    account = new Account({ name });
    await account.save();
  }
  return account;
}

// ✅ CREATE SEND
const createSend = async (data) => {
  let {
    senderName,
    receiverName,
    amount = 0,
    product = 0,
    payDebt,
    type,
    note,
    date,
  } = data;
  senderName = senderName.toLowerCase();
  receiverName = receiverName.toLowerCase();
  // create transaction
  const sendTxn = new Send({
    senderName,
    receiverName,
    amount,
    product,
    payDebt,
    type,
    note,
    date: date || new Date(),
  });
  await sendTxn.save();

  // accounts
  const senderAcc = await getOrCreateAccount(senderName);
  const receiverAcc = await getOrCreateAccount(receiverName);

  // transaction refs
  senderAcc.transactions.sendTransactions.push({
    name: receiverName,
    amount,
    product,
    trxId: sendTxn._id,
    note,
    date: sendTxn.date,
  });
  receiverAcc.transactions.receiverTransactions.push({
    name: senderName,
    amount,
    product,
    trxId: sendTxn._id,
    note,
    date: sendTxn.date,
  });

  // balances/products
  if (!payDebt) {
    if (type == "amount") {
      senderAcc.balance -= amount;
      receiverAcc.balance += amount;
    } else if (type == "product") {
      senderAcc.product -= product;
      receiverAcc.product += product;
    } else if (type == "both") {
      senderAcc.balance -= amount;
      receiverAcc.balance += amount;
      senderAcc.product -= product;
      receiverAcc.product += product;
    }
    senderAcc.debitors.push({
      name: receiverName,
      amount,
      product,
      trxId: sendTxn._id,
      note,
      date: sendTxn.date,
    });
    receiverAcc.creditors.push({
      name: senderName,
      amount,
      product,
      trxId: sendTxn._id,
      note,
      date: sendTxn.date,
    });
  } else {
    if (type === "amount") {
      senderAcc.balance -= amount;
      receiverAcc.balance += amount;
      if (payDebt) {
        // find the creditor
        const creditor = senderAcc.creditors.find(
          (c) => c.name === receiverName
        );
        const debitor = receiverAcc.debitors.find((d) => d.name === senderName);
        if (creditor && debitor) {
          let newBalance = creditor.amount - amount;
          if (newBalance > 0) {
            creditor.amount = newBalance;
            debitor.amount = newBalance;
          } else if (newBalance < 0) {
            // remove creditor and debitor
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (d) => d.name !== senderName
            );
            // add new debitor and creditor with the remaining amount
            senderAcc.debitors.push({
              name: receiverName,
              amount: -newBalance,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
            receiverAcc.creditors.push({
              name: senderName,
              amount: -newBalance,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
          } else {
            // exact settlement
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (d) => d.name !== senderName
            );
          }
        }
      }
    } else if (type === "product") {
      senderAcc.product -= product;
      receiverAcc.product += product;
      if (payDebt) {
        const creditor = senderAcc.creditors.find(
          (c) => c.name === receiverName
        );
        const debitor = receiverAcc.debitors.find((d) => d.name === senderName);
        if (creditor && debitor) {
          let newProduct = creditor.product - product;
          if (newProduct > 0) {
            creditor.product = newProduct;
            debitor.product = newProduct;
          } else if (newProduct < 0) {
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (d) => d.name !== senderName
            );
            senderAcc.debitors.push({
              name: receiverName,
              product: -newProduct,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
            receiverAcc.creditors.push({
              name: senderName,
              product: -newProduct,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
          } else {
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (d) => d.name !== senderName
            );
          }
        }
      }
    } else if (type === "both") {
      senderAcc.balance -= amount;
      receiverAcc.balance += amount;
      senderAcc.product -= product;
      receiverAcc.product += product;
      if (payDebt) {
        // Handle amount part
        const creditorAmt = senderAcc.creditors.find(
          (c) => c.name === receiverName
        );
        const debitorAmt = receiverAcc.debitors.find(
          (d) => d.name === senderName
        );
        if (creditorAmt && debitorAmt) {
          let newBalance = creditorAmt.amount - amount;
          let newProduct = creditorAmt.product - product;
          if (newBalance > 0) {
            creditorAmt.amount = newBalance;
            debitorAmt.amount = newBalance;
          } else if (newBalance < 0) {
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (d) => d.name !== senderName
            );
            senderAcc.debitors.push({
              name: receiverName,
              amount: -newBalance,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
            receiverAcc.creditors.push({
              name: senderName,
              amount: -newBalance,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
          }
          if (newProduct > 0) {
            creditorAmt.product = newProduct;
            debitorAmt.product = newProduct;
          } else if (newProduct < 0) {
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (d) => d.name !== senderName
            );
            senderAcc.debitors.push({
              name: receiverName,
              product: -newProduct,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
            receiverAcc.creditors.push({
              name: senderName,
              product: -newProduct,
              trxId: sendTxn._id,
              note,
              date: sendTxn.date,
            });
          } else {
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
            receiverAcc.debitors = receiverAcc.debitors.filter(
              (c) => c.name !== senderName
            );
          }
        }
      }
    }
  }
  await senderAcc.save();
  await receiverAcc.save();
  return sendTxn;
};

// ✅ DELETE SEND (mirror of createSend)
const deleteSend = async (sendId) => {
  const sendTxn = await Send.findById(sendId);
  if (!sendTxn) throw new Error("Send transaction not found");

  let {
    senderName,
    receiverName,
    amount = 0,
    product = 0,
    payDebt,
    type,
    note,
    date,
  } = sendTxn;

  senderName = senderName.toLowerCase();
  receiverName = receiverName.toLowerCase();

  // accounts
  const senderAcc = await getOrCreateAccount(senderName);
  const receiverAcc = await getOrCreateAccount(receiverName);

  // remove transaction refs
  senderAcc.transactions.sendTransactions =
    senderAcc.transactions.sendTransactions.filter(
      (t) => !t.trxId.equals(sendId)
    );
  receiverAcc.transactions.receiverTransactions =
    receiverAcc.transactions.receiverTransactions.filter(
      (t) => !t.trxId.equals(sendId)
    );

  // reverse balances/products
  if (!payDebt) {
    if (type === "amount") {
      senderAcc.balance += amount;
      receiverAcc.balance -= amount;
    } else if (type === "product") {
      senderAcc.product += product;
      receiverAcc.product -= product;
    } else if (type === "both") {
      senderAcc.balance += amount;
      receiverAcc.balance -= amount;
      senderAcc.product += product;
      receiverAcc.product -= product;
    }

    // remove debitors/creditors
    senderAcc.debitors = senderAcc.debitors.filter(
      (d) => !d.trxId.equals(sendId)
    );
    receiverAcc.creditors = receiverAcc.creditors.filter(
      (c) => !c.trxId.equals(sendId)
    );
  } else {
    if (type === "amount") {
      senderAcc.balance += amount;
      receiverAcc.balance -= amount;

      const creditor = senderAcc.creditors.find((c) => c.name === receiverName);
      const debitor = receiverAcc.debitors.find((d) => d.name === senderName);
      if (creditor && debitor) {
        let newBalance = creditor.amount + amount;

        if (newBalance > 0) {
          creditor.amount = newBalance;
          debitor.amount = newBalance;
        } else if (newBalance < 0) {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
          senderAcc.debitors.push({
            name: receiverName,
            amount: -newBalance,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
          receiverAcc.creditors.push({
            name: senderName,
            amount: -newBalance,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
        } else {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
        }
      }
    } else if (type === "product") {
      senderAcc.product += product;
      receiverAcc.product -= product;

      const creditor = senderAcc.creditors.find((c) => c.name === receiverName);
      const debitor = receiverAcc.debitors.find((d) => d.name === senderName);
      if (creditor && debitor) {
        let newProduct = creditor.product + product;

        if (newProduct > 0) {
          creditor.product = newProduct;
          debitor.product = newProduct;
        } else if (newProduct < 0) {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
          senderAcc.debitors.push({
            name: receiverName,
            product: -newProduct,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
          receiverAcc.creditors.push({
            name: senderName,
            product: -newProduct,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
        } else {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
        }
      }
    } else if (type === "both") {
      senderAcc.balance += amount;
      receiverAcc.balance -= amount;
      senderAcc.product += product;
      receiverAcc.product -= product;

      const creditorAmt = senderAcc.creditors.find(
        (c) => c.name === receiverName
      );
      const debitorAmt = receiverAcc.debitors.find(
        (d) => d.name === senderName
      );
      if (creditorAmt && debitorAmt) {
        let newBalance = creditorAmt.amount + amount;
        let newProduct = creditorAmt.product + product;

        if (newBalance > 0) {
          creditorAmt.amount = newBalance;
          debitorAmt.amount = newBalance;
        } else if (newBalance < 0) {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
          senderAcc.debitors.push({
            name: receiverName,
            amount: -newBalance,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
          receiverAcc.creditors.push({
            name: senderName,
            amount: -newBalance,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
        } else {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
        }

        if (newProduct > 0) {
          creditorAmt.product = newProduct;
          debitorAmt.product = newProduct;
        } else if (newProduct < 0) {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
          senderAcc.debitors.push({
            name: receiverName,
            product: -newProduct,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
          receiverAcc.creditors.push({
            name: senderName,
            product: -newProduct,
            trxId: sendTxn._id,
            note,
            date: sendTxn.date,
          });
        } else {
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
        }
      }
    }
  }

  await senderAcc.save();
  await receiverAcc.save();
  await Send.findByIdAndDelete(sendId);

  return { message: "Send transaction fully reversed and deleted" };
};

// ✅ GET ALL SENDS
const getAllSends = async () => Send.find();

module.exports = { createSend, getAllSends, deleteSend };
