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
  const { receiverName, senderName, amount, product, note } = data;

  const receiveTxn = new Receive({
    receiverName,
    senderName,
    amount,
    product,
    note,
  });
  await receiveTxn.save();

  const receiverAcc = await getOrCreateAccount(receiverName);
  const senderAcc = await getOrCreateAccount(senderName);

  receiverAcc.transactions.receiverTransactions.push({
    name: senderName,
    amount,
    product,
    trxId: receiveTxn._id,
    note,
    date: new Date(),
  });

  senderAcc.transactions.sendTransactions.push({
    name: receiverName,
    amount,
    product,
    trxId: receiveTxn._id,
    note,
    date: new Date(),
  });

  receiverAcc.balance += amount;
  receiverAcc.product += product;
  senderAcc.balance -= amount;
  senderAcc.product -= product;

  await receiverAcc.save();
  await senderAcc.save();

  return receiveTxn;
};

const getAllReceives = async () => Receive.find();

module.exports = { createReceive, getAllReceives };
