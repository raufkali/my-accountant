const Send = require("../models/SendTrx");
const Account = require("../models/Account");

// ✅ Helper to get/create account
async function getOrCreateAccount(name, userId) {
  name = name.toLowerCase();
  let account = await Account.findOne({ name, userId });
  if (!account) {
    account = new Account({ name, userId });
    await account.save();
  }
  return account;
}

// ✅ Create send transaction
const createSend = async (data, userId) => {
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

  // Create transaction
  const sendTxn = new Send({
    senderName,
    receiverName,
    amount,
    product,
    payDebt,
    type,
    note,
    date,
    userId,
  });
  await sendTxn.save();

  // Update accounts
  const sender = await getOrCreateAccount(senderName, userId);
  const receiver = await getOrCreateAccount(receiverName, userId);

  sender.sends.push({
    name: receiverName,
    amount,
    product,
    trxId: sendTxn._id,
    note,
    date,
  });
  receiver.receives.push({
    name: senderName,
    amount,
    product,
    trxId: sendTxn._id,
    note,
    date,
  });

  await sender.save();
  await receiver.save();

  return sendTxn;
};

// ✅ Get all sends (user-specific)
const getSends = async (userId) => {
  return await Send.find({ userId }).sort({ date: -1 });
};

// ✅ Delete send transaction
const deleteSend = async (id, userId) => {
  const sendTxn = await Send.findOne({ _id: id, userId });
  if (!sendTxn) return null;

  const { senderName, receiverName, amount, product } = sendTxn;

  const sender = await Account.findOne({ name: senderName, userId });
  const receiver = await Account.findOne({ name: receiverName, userId });

  if (sender) {
    sender.sends = sender.sends.filter((s) => s.trxId.toString() !== id);
    await sender.save();
  }
  if (receiver) {
    receiver.receives = receiver.receives.filter(
      (r) => r.trxId.toString() !== id
    );
    await receiver.save();
  }

  await Send.deleteOne({ _id: id, userId });
  return sendTxn;
};

// ✅ Update send transaction
const updateSend = async (id, data, userId) => {
  const sendTxn = await Send.findOneAndUpdate(
    { _id: id, userId },
    { $set: data },
    { new: true }
  );
  return sendTxn;
};

module.exports = {
  createSend,
  getSends,
  deleteSend,
  updateSend,
};
