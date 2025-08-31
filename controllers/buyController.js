const Buy = require("../models/BuyTrx");
const Account = require("../models/Account");
const mongoose = require("mongoose");

async function getOrCreateAccount(name, userId) {
  name = name.toLowerCase();
  let account = await Account.findOne({ name, userId });
  if (!account) {
    account = new Account({ name, userId });
    await account.save();
  }
  return account.toObject();
}

// ✅ Create Buy Transaction
const createBuy = async (data, userId) => {
  const { buyerName, sellerName, buyingRate, totQuantity, payingMethod, note } =
    data;
  const totalAmount = buyingRate * totQuantity;

  const buyTxn = new Buy({
    buyerName: buyerName.toLowerCase(),
    sellerName: sellerName.toLowerCase(),
    buyingRate,
    totQuantity,
    payingMethod,
    note,
    userId,
  });
  await buyTxn.save();

  const buyerAcc = await getOrCreateAccount(buyerName, userId);
  const sellerAcc = await getOrCreateAccount(sellerName, userId);

  buyerAcc.transactions.buyTransactions.push({
    name: sellerName,
    amount: totalAmount,
    trxId: buyTxn._id,
    note,
    date: new Date(),
  });

  sellerAcc.transactions.sellTransactions.push({
    name: buyerName,
    amount: totalAmount,
    trxId: buyTxn._id,
    note,
    date: new Date(),
  });

  if (payingMethod === "paid") {
    buyerAcc.balance -= totalAmount;
    sellerAcc.balance += totalAmount;
  } else if (payingMethod === "unpaid") {
    sellerAcc.creditors.push({
      name: buyerName,
      amount: totalAmount,
      trxId: buyTxn._id,
      note,
      date: new Date(),
    });
    buyerAcc.debitors.push({
      name: sellerName,
      amount: totalAmount,
      trxId: buyTxn._id,
      note,
      date: new Date(),
    });
  }

  buyerAcc.product += totQuantity;
  sellerAcc.product -= totQuantity;

  await buyerAcc.save();
  await sellerAcc.save();

  return buyTxn.toObject();
};

// ✅ Delete Buy Transaction
const deleteBuy = async (buyId, userId) => {
  const buyTxn = await Buy.findOne({ _id: buyId, userId });
  if (!buyTxn) {
    throw new Error("Buy transaction not found");
  }

  const { buyerName, sellerName, buyingRate, totQuantity, payingMethod } =
    buyTxn;

  const totalAmount = buyingRate * totQuantity;

  const buyerAcc = await getOrCreateAccount(buyerName, userId);
  const sellerAcc = await getOrCreateAccount(sellerName, userId);

  buyerAcc.transactions.buyTransactions =
    buyerAcc.transactions.buyTransactions.filter(
      (t) => t.trxId.toString() !== buyId.toString()
    );

  sellerAcc.transactions.sellTransactions =
    sellerAcc.transactions.sellTransactions.filter(
      (t) => t.trxId.toString() !== buyId.toString()
    );

  if (payingMethod === "paid") {
    buyerAcc.balance += totalAmount;
    sellerAcc.balance -= totalAmount;
  } else if (payingMethod === "unpaid") {
    sellerAcc.creditors = sellerAcc.creditors.filter(
      (c) => c.trxId.toString() !== buyId.toString()
    );
    buyerAcc.debitors = buyerAcc.debitors.filter(
      (d) => d.trxId.toString() !== buyId.toString()
    );
  }

  buyerAcc.product -= totQuantity;
  sellerAcc.product += totQuantity;

  await buyerAcc.save();
  await sellerAcc.save();

  await Buy.deleteOne({ _id: buyId, userId });

  return { message: "Buy transaction deleted successfully" };
};

// ✅ Get all Buys (user-specific)
const getAllBuys = async (userId) => {
  Buy.find(userId).sort({ date: -1 });
};

module.exports = { createBuy, getAllBuys, deleteBuy };
