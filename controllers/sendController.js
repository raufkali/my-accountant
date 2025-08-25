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

const createSend = async (data) => {
  const {
    senderName,
    receiverName,
    amount = 0,
    product = 0,
    payDebt,
    type,
    note,
    date,
  } = data;

  // Create Send Transaction
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

  // Get Accounts
  const senderAcc = await getOrCreateAccount(senderName);
  const receiverAcc = await getOrCreateAccount(receiverName);

  // Add transactions
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

  // Update balances/products based on type
  if (type === "amount") {
    senderAcc.balance -= amount;
    receiverAcc.balance += amount;
  } else if (type === "product") {
    senderAcc.product -= product;
    receiverAcc.product += product;
  } else if (type === "both") {
    senderAcc.balance -= amount;
    receiverAcc.balance += amount;
    senderAcc.product -= product;
    receiverAcc.product += product;
  }

  // Handle payDebt
  if (payDebt) {
    // Case 1: Sender owes Receiver
    let debtEntry = senderAcc.debitors.find((d) => d.name === receiverName);
    if (debtEntry) {
      debtEntry.amount -= amount;

      if (debtEntry.amount < 0) {
        // Overpayment → clear debt and create credit
        const overPay = Math.abs(debtEntry.amount);
        senderAcc.debitors = senderAcc.debitors.filter(
          (d) => d.name !== receiverName
        );

        // Add credit on receiver side
        receiverAcc.creditors.push({
          name: senderName,
          amount: overPay,
          trxId: sendTxn._id,
          note,
          date: sendTxn.date,
        });
      } else if (debtEntry.amount === 0) {
        senderAcc.debitors = senderAcc.debitors.filter(
          (d) => d.name !== receiverName
        );
        receiverAcc.creditors = receiverAcc.creditors.filter(
          (c) => c.name !== senderName
        );
      } else {
        // Reduce creditor on receiver side too
        let creditorEntry = receiverAcc.creditors.find(
          (c) => c.name === senderName
        );
        if (creditorEntry) {
          creditorEntry.amount -= amount;
          if (creditorEntry.amount <= 0) {
            receiverAcc.creditors = receiverAcc.creditors.filter(
              (c) => c.name !== senderName
            );
          }
        }
      }
    } else {
      // Case 2: Receiver owes Sender
      let debtEntry2 = receiverAcc.debitors.find((d) => d.name === senderName);
      if (debtEntry2) {
        debtEntry2.amount -= amount;

        if (debtEntry2.amount < 0) {
          // Overpayment → clear debt and create credit
          const overPay = Math.abs(debtEntry2.amount);
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );

          senderAcc.creditors.push({
            name: receiverName,
            amount: overPay,
            trxId: sendTxn._id,
            note: sendTxn.note,
            date: sendTxn.date,
          });
        } else if (debtEntry2.amount === 0) {
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
          senderAcc.creditors = senderAcc.creditors.filter(
            (c) => c.name !== receiverName
          );
        } else {
          // Reduce creditor on sender side
          let creditorEntry2 = senderAcc.creditors.find(
            (c) => c.name === receiverName
          );
          if (creditorEntry2) {
            creditorEntry2.amount -= amount;
            if (creditorEntry2.amount <= 0) {
              senderAcc.creditors = senderAcc.creditors.filter(
                (c) => c.name !== receiverName
              );
            }
          }
        }
      }
    }
  }

  await senderAcc.save();
  await receiverAcc.save();

  return sendTxn;
};

// Delete a Send Transaction (with payDebt rollback)
const deleteSend = async (sendId) => {
  const sendTxn = await Send.findById(sendId);
  if (!sendTxn) {
    throw new Error("Send transaction not found");
  }

  const {
    senderName,
    receiverName,
    amount = 0,
    product = 0,
    type,
    payDebt,
  } = sendTxn;

  // 1. Get accounts
  const senderAcc = await getOrCreateAccount(senderName);
  const receiverAcc = await getOrCreateAccount(receiverName);

  // 2. Remove transaction references
  senderAcc.transactions.sendTransactions =
    senderAcc.transactions.sendTransactions.filter(
      (t) => t.trxId.toString() !== sendId.toString()
    );
  receiverAcc.transactions.receiverTransactions =
    receiverAcc.transactions.receiverTransactions.filter(
      (t) => t.trxId.toString() !== sendId.toString()
    );

  // 3. Revert balances/products based on type
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

  // 4. Rollback payDebt
  if (payDebt) {
    // Always restore as debt (since we are undoing overpayment too)
    let debtEntry = senderAcc.debitors.find((d) => d.name === receiverName);
    if (debtEntry) {
      debtEntry.amount += amount;
    } else {
      senderAcc.debitors.push({
        name: receiverName,
        amount,
        trxId: sendTxn._id,
        note: sendTxn.note,
        date: sendTxn.date,
      });
    }

    let creditorEntry = receiverAcc.creditors.find(
      (c) => c.name === senderName
    );
    if (creditorEntry) {
      creditorEntry.amount += amount;
    } else {
      receiverAcc.creditors.push({
        name: senderName,
        amount,
        trxId: sendTxn._id,
        note: sendTxn.note,
        date: sendTxn.date,
      });
    }
  }

  // 5. Save accounts
  await senderAcc.save();
  await receiverAcc.save();

  // 6. Delete the transaction
  await Send.findByIdAndDelete(sendId);

  return { message: "Send transaction deleted successfully" };
};

const getAllSends = async () => Send.find();

module.exports = { createSend, getAllSends, deleteSend };
