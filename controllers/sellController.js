const Sell = require("../models/SellTrx");
const Account = require("../models/Account");
const Person = require("../models/Person");
// Helper: get or create account
async function getOrCreateAccount(name) {
  name = name.lower();
  let account = await Account.findOne({ name });
  if (!account) {
    account = new Account({
      name,
      balance: 0,
      product: 0,
      transactions: {
        sendTransactions: [],
        sellTransactions: [],
        receiverTransactions: [],
        buyTransactions: [],
      },
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
  } = data;

  // 1. Save in Sell collection
  const sellTxn = new Sell({
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

  // 2. Get accounts
  const sellerAcc = await getOrCreateAccount(sellerName);
  const buyerAcc = await getOrCreateAccount(buyerName);

  // 3. Add to seller's Sell Transactions
  sellerAcc.transactions.sellTransactions.push({
    name: buyerName,
    amount: sellingRate * totQuantity,
  });

  // 4. Add to buyer's Buy Transactions
  buyerAcc.transactions.buyTransactions.push({
    name: sellerName,
    amount: sellingRate * totQuantity,
  });

  // Update balances depending on payingMethod
  if (payingMethod === "paid") {
    sellerAcc.balance += sellingRate * totQuantity;
    sellerAcc.product -= totQuantity;
    buyerAcc.balance -= sellingRate * totQuantity;
    buyerAcc.product += totQuantity;
  } else if (payingMethod === "payToDebtor") {
    // Seller doesn’t get direct payment
    // Buyer pays debtors
    for (let debtor of debtors) {
      const debtorAcc = await getOrCreateAccount(debtor.name);
      debtorAcc.transactions.receiverTransactions.push({
        name: buyerName,
        amount: debtor.amount,
      });
      debtorAcc.balance += debtor.amount;
      // sellerAcc.sendTransactions.push(debtor); <<<<<<< WIll stark working on this
      await debtorAcc.save();
    }
  } else if (payingMethod == "unpaid") {
    sellerAcc.balance -= sellingRate * totQuantity;
    buyerAcc.balance += sellingRate * totQuantity;
  }

  await sellerAcc.save();
  await buyerAcc.save();

  return sellTxn;
};

// Get all sells
const getAllSells = async () => {
  return await Sell.find();
};

module.exports = {
  createSell,
  getAllSells,
};
