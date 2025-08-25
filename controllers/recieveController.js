const Receive = require("../models/RecieveTrx");
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

const createReceive = async (data) => {
  const {
    receiverName,
    senderName,
    amount = 0,
    product = 0,
    payDebt,
    type,
    note,
    date,
  } = data;

  // Create transaction
  const receiveTxn = new Receive({
    receiverName,
    senderName,
    amount,
    product,
    payDebt,
    type,
    note,
    date: date || new Date(),
  });
  await receiveTxn.save();

  // Get or create accounts
  const receiverAcc = await getOrCreateAccount(receiverName);
  const senderAcc = await getOrCreateAccount(senderName);

  // Add transactions to both accounts
  receiverAcc.transactions.receiverTransactions.push({
    name: senderName,
    amount,
    product,
    trxId: receiveTxn._id,
    note,
    date: receiveTxn.date,
  });

  senderAcc.transactions.sendTransactions.push({
    name: receiverName,
    amount,
    product,
    trxId: receiveTxn._id,
    note,
    date: receiveTxn.date,
  });

  // Update balances/products according to type
  if (type === "amount") {
    receiverAcc.balance += amount;
    senderAcc.balance -= amount;
  } else if (type === "product") {
    receiverAcc.product += product;
    senderAcc.product -= product;
  } else if (type === "both") {
    receiverAcc.balance += amount;
    senderAcc.balance -= amount;
    receiverAcc.product += product;
    senderAcc.product -= product;
  }

  // Handle payDebt
  if (payDebt) {
    // Case 1: Sender owes Receiver
    let debtEntry = senderAcc.debitors.find((d) => d.name === receiverName);
    if (debtEntry) {
      debtEntry.amount -= amount;
      if (debtEntry.amount < 0) {
        // Overpayment → Receiver now owes Sender
        const overpay = Math.abs(debtEntry.amount);
        senderAcc.debitors = senderAcc.debitors.filter(
          (d) => d.name !== receiverName
        );

        // Add creditor entry for Sender
        let senderCreditor = senderAcc.creditors.find(
          (c) => c.name === receiverName
        );
        if (senderCreditor) senderCreditor.amount += overpay;
        else
          senderAcc.creditors.push({
            name: receiverName,
            amount: overpay,
            trxId: receiveTxn._id,
            note,
            date: receiveTxn.date,
          });

        // Add debtor entry for Receiver
        let receiverDebtor = receiverAcc.debitors.find(
          (d) => d.name === senderName
        );
        if (receiverDebtor) receiverDebtor.amount += overpay;
        else
          receiverAcc.debitors.push({
            name: senderName,
            amount: overpay,
            trxId: receiveTxn._id,
            note,
            date: receiveTxn.date,
          });
      } else if (debtEntry.amount === 0) {
        senderAcc.debitors = senderAcc.debitors.filter(
          (d) => d.name !== receiverName
        );
      }

      // Mirror creditor on receiver side
      let receiverCreditor = receiverAcc.creditors.find(
        (c) => c.name === senderName
      );
      if (receiverCreditor) {
        receiverCreditor.amount -= amount;
        if (receiverCreditor.amount <= 0) {
          receiverAcc.creditors = receiverAcc.creditors.filter(
            (c) => c.name !== senderName
          );
        }
      }
    } else {
      // Case 2: Receiver owes Sender
      let debtEntry2 = receiverAcc.debitors.find((d) => d.name === senderName);
      if (debtEntry2) {
        debtEntry2.amount -= amount;
        if (debtEntry2.amount < 0) {
          const overpay = Math.abs(debtEntry2.amount);
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );

          // Receiver becomes creditor
          let receiverCreditor = receiverAcc.creditors.find(
            (c) => c.name === senderName
          );
          if (receiverCreditor) receiverCreditor.amount += overpay;
          else
            receiverAcc.creditors.push({
              name: senderName,
              amount: overpay,
              trxId: receiveTxn._id,
              note,
              date: receiveTxn.date,
            });

          // Sender becomes debtor
          let senderDebtor = senderAcc.debitors.find(
            (d) => d.name === receiverName
          );
          if (senderDebtor) senderDebtor.amount += overpay;
          else
            senderAcc.debitors.push({
              name: receiverName,
              amount: overpay,
              trxId: receiveTxn._id,
              note,
              date: receiveTxn.date,
            });
        } else if (debtEntry2.amount === 0) {
          receiverAcc.debitors = receiverAcc.debitors.filter(
            (d) => d.name !== senderName
          );
        }

        // Mirror creditor on sender side
        let senderCreditor2 = senderAcc.creditors.find(
          (c) => c.name === receiverName
        );
        if (senderCreditor2) {
          senderCreditor2.amount -= amount;
          if (senderCreditor2.amount <= 0) {
            senderAcc.creditors = senderAcc.creditors.filter(
              (c) => c.name !== receiverName
            );
          }
        }
      }
    }
  }

  await receiverAcc.save();
  await senderAcc.save();

  return receiveTxn;
};

// Delete a Receive Transaction
const deleteReceive = async (receiveId) => {
  const receiveTxn = await Receive.findById(receiveId);
  if (!receiveTxn) {
    throw new Error("Receive transaction not found");
  }

  const {
    receiverName,
    senderName,
    amount = 0,
    product = 0,
    type,
    payDebt,
  } = receiveTxn;

  // 1. Get accounts
  const receiverAcc = await getOrCreateAccount(receiverName);
  const senderAcc = await getOrCreateAccount(senderName);

  // 2. Remove transaction references
  receiverAcc.transactions.receiverTransactions =
    receiverAcc.transactions.receiverTransactions.filter(
      (t) => t.trxId.toString() !== receiveId.toString()
    );
  senderAcc.transactions.sendTransactions =
    senderAcc.transactions.sendTransactions.filter(
      (t) => t.trxId.toString() !== receiveId.toString()
    );

  // 3. Revert balances/products based on type
  if (type === "amount") {
    receiverAcc.balance -= amount;
    senderAcc.balance += amount;
  } else if (type === "product") {
    receiverAcc.product -= product;
    senderAcc.product += product;
  } else if (type === "both") {
    receiverAcc.balance -= amount;
    senderAcc.balance += amount;
    receiverAcc.product -= product;
    senderAcc.product += product;
  }

  // 4. Rollback payDebt (simplified → restore debt)
  if (payDebt) {
    let debtEntry = senderAcc.debitors.find((d) => d.name === receiverName);
    if (debtEntry) debtEntry.amount += amount;
    else
      senderAcc.debitors.push({
        name: receiverName,
        amount,
        trxId: receiveTxn._id,
        note: receiveTxn.note,
        date: receiveTxn.date,
      });

    let creditorEntry = receiverAcc.creditors.find(
      (c) => c.name === senderName
    );
    if (creditorEntry) creditorEntry.amount += amount;
    else
      receiverAcc.creditors.push({
        name: senderName,
        amount,
        trxId: receiveTxn._id,
        note: receiveTxn.note,
        date: receiveTxn.date,
      });
  }

  // 5. Save updated accounts
  await receiverAcc.save();
  await senderAcc.save();

  // 6. Delete the transaction itself
  await Receive.findByIdAndDelete(receiveId);

  return { message: "Receive transaction deleted successfully" };
};

const getAllReceives = async () => Receive.find();

module.exports = { createReceive, getAllReceives, deleteReceive };
