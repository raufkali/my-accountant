const Sell = require("../models/SellTrx");
const Account = require("../models/Account");

// Helper: get or create account with userId
async function getOrCreateAccount(name, userId) {
  name = name.toLowerCase();
  let account = await Account.findOne({ name, userId });
  if (!account) {
    account = new Account({
      userId,
      name,
      balance: 0,
      product: 0,
      transactions: {
        sendTransactions: [],
        sellTransactions: [],
        receiverTransactions: [],
        buyTransactions: [],
      },
      debitors: [],
      creditors: [],
    });
    await account.save();
  }
  return account;
}

// Create a Sell Transaction
const createSell = async (data) => {
  const {
    sellerName,
    buyerName,
    sellingRate,
    totQuantity,
    payingMethod,
    debtors,
    note,
    userId, // ✅ added
  } = data;

  const totalAmount = sellingRate * totQuantity;

  // 1. Save in Sell collection
  const sellTxn = new Sell({
    userId, // ✅ link transaction to user
    sellerName,
    buyerName,
    sellingRate,
    totQuantity,
    payingMethod,
    numOfDebtors: debtors ? debtors.length : 0,
    debtors: debtors || [],
    note,
  });
  await sellTxn.save();

  // 2. Get accounts (with userId)
  const sellerAcc = await getOrCreateAccount(sellerName, userId);
  const buyerAcc = await getOrCreateAccount(buyerName, userId);

  // 3. Add to seller's Sell Transactions
  sellerAcc.transactions.sellTransactions.push({
    name: buyerName,
    amount: totalAmount,
    product: totQuantity,
    trxId: sellTxn._id,
    note,
    date: new Date(),
  });

  // 4. Add to buyer's Buy Transactions
  buyerAcc.transactions.buyTransactions.push({
    name: sellerName,
    amount: totalAmount,
    product: totQuantity,
    trxId: sellTxn._id,
    note,
    date: new Date(),
  });

  // 5. Update balances depending on payingMethod
  if (payingMethod === "paid") {
    sellerAcc.balance += totalAmount;
    buyerAcc.balance -= totalAmount;
  } else if (payingMethod === "payToDebtor" && debtors) {
    for (let debtor of debtors) {
      const debtorAcc = await getOrCreateAccount(debtor.name, userId);

      debtorAcc.balance += debtor.amount;
      buyerAcc.balance -= debtor.amount;

      if (debtor.name !== sellerName) {
        sellerAcc.transactions.sendTransactions.push({
          name: debtor.name,
          amount: debtor.amount,
          trxId: sellTxn._id,
          note,
          date: new Date(),
        });
        debtorAcc.transactions.receiverTransactions.push({
          name: buyerName,
          amount: debtor.amount,
          trxId: sellTxn._id,
          note,
          date: new Date(),
        });
      } else {
        debtorAcc.transactions.receiverTransactions.push({
          name: buyerName,
          amount: debtor.amount,
          trxId: sellTxn._id,
          note,
          date: new Date(),
        });
      }

      await debtorAcc.save();
    }
  } else if (payingMethod === "unpaid") {
    sellerAcc.creditors.push({
      name: buyerName,
      amount: totalAmount,
      trxId: sellTxn._id,
      note,
      date: new Date(),
    });
    buyerAcc.debitors.push({
      name: sellerName,
      amount: totalAmount,
      trxId: sellTxn._id,
      note,
      date: new Date(),
    });
  }

  // 6. Product updates
  sellerAcc.product -= totQuantity;
  buyerAcc.product += totQuantity;

  await sellerAcc.save();
  await buyerAcc.save();

  return sellTxn;
};

// Get all sells (for one user)
const getAllSells = async (userId) => {
  return await Sell.find({ userId });
};

// Delete a Sell Transaction
const deleteSell = async (sellId, userId) => {
  const sellTxn = await Sell.findOne({ _id: sellId, userId });
  if (!sellTxn) {
    throw new Error("Sell transaction not found");
  }

  const {
    sellerName,
    buyerName,
    sellingRate,
    totQuantity,
    payingMethod,
    debtors,
  } = sellTxn;

  const totalAmount = sellingRate * totQuantity;

  // 1. Get accounts
  const sellerAcc = await getOrCreateAccount(sellerName, userId);
  const buyerAcc = await getOrCreateAccount(buyerName, userId);

  // 2. Remove transaction references
  sellerAcc.transactions.sellTransactions =
    sellerAcc.transactions.sellTransactions.filter(
      (t) => t.trxId.toString() !== sellId.toString()
    );
  buyerAcc.transactions.buyTransactions =
    buyerAcc.transactions.buyTransactions.filter(
      (t) => t.trxId.toString() !== sellId.toString()
    );

  // 3. Revert balances depending on payingMethod
  if (payingMethod === "paid") {
    sellerAcc.balance -= totalAmount;
    buyerAcc.balance += totalAmount;
  } else if (payingMethod === "payToDebtor" && debtors) {
    for (let debtor of debtors) {
      const debtorAcc = await getOrCreateAccount(debtor.name, userId);

      debtorAcc.balance -= debtor.amount;
      buyerAcc.balance += debtor.amount;

      sellerAcc.transactions.sendTransactions =
        sellerAcc.transactions.sendTransactions.filter(
          (t) => t.trxId.toString() !== sellId.toString()
        );
      debtorAcc.transactions.receiverTransactions =
        debtorAcc.transactions.receiverTransactions.filter(
          (t) => t.trxId.toString() !== sellId.toString()
        );

      await debtorAcc.save();
    }
  } else if (payingMethod === "unpaid") {
    sellerAcc.creditors = sellerAcc.creditors.filter(
      (c) => c.trxId.toString() !== sellId.toString()
    );
    buyerAcc.debitors = buyerAcc.debitors.filter(
      (d) => d.trxId.toString() !== sellId.toString()
    );
  }

  // 4. Revert product updates
  sellerAcc.product += totQuantity;
  buyerAcc.product -= totQuantity;

  await sellerAcc.save();
  await buyerAcc.save();

  // 5. Delete sell transaction
  await Sell.findOneAndDelete({ _id: sellId, userId });

  return { message: "Sell transaction deleted successfully" };
};

module.exports = {
  createSell,
  getAllSells,
  deleteSell,
};
