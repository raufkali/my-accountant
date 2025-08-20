const Sell = require("../models/SellTrx");
const Account = require("../models/Account");
const Person = require("../models/Person");

// Helper: get or create account
async function getOrCreateAccount(name) {
  name = name.toLowerCase();
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
  } = data;

  const totalAmount = sellingRate * totQuantity;

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
    amount: totalAmount,
    trxId: sellTxn._id,
    note,
    date: new Date(),
  });

  // 4. Add to buyer's Buy Transactions
  buyerAcc.transactions.buyTransactions.push({
    name: sellerName,
    amount: totalAmount,
    trxId: sellTxn._id,
    note,
    date: new Date(),
  });

  // 5. Update balances depending on payingMethod
  if (payingMethod === "paid") {
    sellerAcc.balance += totalAmount;
    buyerAcc.balance -= totalAmount;
  } else if (payingMethod === "payToDebtor" && debtors) {
    // Buyer pays debtors directly
    for (let debtor of debtors) {
      const debtorAcc = await getOrCreateAccount(debtor.name);

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
        // debtor is actually the seller
        debtorAcc.transactions.receiverTransactions.push({
          name: buyerName,
          amount: debtor.amount,
          trxId: sellTxn._id,
          note,
          date: new Date(),
        });
      }

      // Update creditors/debitors relation
      debtorAcc.creditors.forEach((entry) => {
        let found = false;
        if (entry.name === sellerName) {
          found = true;
          let remaining = entry.amount - debtor.amount;
          if (remaining >= 0) {
            entry.amount = remaining;
          } else {
            entry.amount = 0;
            sellerAcc.creditors.push({
              name: entry.name,
              amount: Math.abs(remaining),
              trxId: sellTxn._id,
              date: new Date(),
              note,
            });
          }
        }
        if (!found) {
          sellerAcc.creditors.push({
            name: debtor.name,
            amount: debtor.amount,
            trxId: sellTxn._id,
            date: new Date(),
            note,
          });
        }
      });

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

// Get all sells
const getAllSells = async () => {
  return await Sell.find();
};

module.exports = {
  createSell,
  getAllSells,
};
