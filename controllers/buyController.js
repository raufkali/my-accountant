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
// Delete a Buy Transaction
const deleteBuy = async (buyId) => {
  const buyTxn = await Buy.findById(buyId);
  if (!buyTxn) {
    throw new Error("Buy transaction not found");
  }

  const { buyerName, sellerName, buyingRate, totQuantity, payingMethod } =
    buyTxn;

  const totalAmount = buyingRate * totQuantity;

  // 1. Get accounts
  const buyerAcc = await getOrCreateAccount(buyerName);
  const sellerAcc = await getOrCreateAccount(sellerName);

  // 2. Remove transaction references
  buyerAcc.transactions.buyTransactions =
    buyerAcc.transactions.buyTransactions.filter(
      (t) => t.trxId.toString() !== buyId.toString()
    );
  sellerAcc.transactions.sellTransactions =
    sellerAcc.transactions.sellTransactions.filter(
      (t) => t.trxId.toString() !== buyId.toString()
    );

  // 3. Revert balances
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

  // 4. Revert product changes
  buyerAcc.product -= totQuantity;
  sellerAcc.product += totQuantity;

  await buyerAcc.save();
  await sellerAcc.save();

  // 5. Delete the Buy transaction itself
  await Buy.findByIdAndDelete(buyId);

  return { message: "Buy transaction deleted successfully" };
};

const getAllBuys = async () => Buy.find();

module.exports = { createBuy, getAllBuys, deleteBuy };
