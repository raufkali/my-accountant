const Buy = require("../models/BuyTrx");
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

const createBuy = async (data) => {
  const { buyerName, sellerName, buyingRate, totQuantity, payingMethod, note } =
    data;
  const totalAmount = buyingRate * totQuantity;

  const buyTxn = new Buy({
    buyerName,
    sellerName,
    buyingRate,
    totQuantity,
    payingMethod,
    note,
  });
  await buyTxn.save();

  const buyerAcc = await getOrCreateAccount(buyerName);
  const sellerAcc = await getOrCreateAccount(sellerName);

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

  return buyTxn;
};

const getAllBuys = async () => Buy.find();

module.exports = { createBuy, getAllBuys };
