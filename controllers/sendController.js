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

  // Optional: payDebt logic (similar to receive if you want to implement)
  // if (payDebt) { ... }

  await senderAcc.save();
  await receiverAcc.save();

  return sendTxn;
};
// Delete a Send Transaction
const deleteSend = async (sendId) => {
  const sendTxn = await Send.findById(sendId);
  if (!sendTxn) {
    throw new Error("Send transaction not found");
  }

  const { senderName, receiverName, amount = 0, product = 0, type } = sendTxn;

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

  // 4. Save accounts
  await senderAcc.save();
  await receiverAcc.save();

  // 5. Delete the transaction
  await Send.findByIdAndDelete(sendId);

  return { message: "Send transaction deleted successfully" };
};

const getAllSends = async () => Send.find();

module.exports = { createSend, getAllSends, deleteSend };
