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
  const { senderName, receiverName, amount, product, note } = data;

  const sendTxn = new Send({ senderName, receiverName, amount, product, note });
  await sendTxn.save();

  const senderAcc = await getOrCreateAccount(senderName);
  const receiverAcc = await getOrCreateAccount(receiverName);

  senderAcc.transactions.sendTransactions.push({
    name: receiverName,
    amount,
    product,
    trxId: sendTxn._id,
    note,
    date: new Date(),
  });

  receiverAcc.transactions.receiverTransactions.push({
    name: senderName,
    amount,
    product,
    trxId: sendTxn._id,
    note,
    date: new Date(),
  });

  senderAcc.balance -= amount;
  senderAcc.produt -= product;
  receiverAcc.balance += amount;
  receiverAcc.product += product;

  await senderAcc.save();
  await receiverAcc.save();

  return sendTxn;
};

const getAllSends = async () => Send.find();

module.exports = { createSend, getAllSends };
