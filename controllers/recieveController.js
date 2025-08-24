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

  // If payDebt handling logic is needed, you can add it here:
  // if (payDebt) {
  //   // Implement debt-clearing between sender and receiver
  // }

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

  // 4. Save updated accounts
  await receiverAcc.save();
  await senderAcc.save();

  // 5. Delete the transaction itself
  await Receive.findByIdAndDelete(receiveId);

  return { message: "Receive transaction deleted successfully" };
};

const getAllReceives = async () => Receive.find();

module.exports = { createReceive, getAllReceives, deleteReceive };
