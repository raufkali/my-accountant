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
    let totalAmount = sellingRate * totQuantity;
    sellerAcc.balance += totalAmount;
    buyerAcc.balance -= totalAmount;
  } else if (payingMethod === "payToDebtor") {
    // Seller doesn’t get direct payment
    // Buyer pays debtors
    for (let debtor of debtors) {
      // create accounts for debtor
      const debtorAcc = await getOrCreateAccount(debtor.name);
      // debtor balance increases while buyer as a sender balance decreases
      debtorAcc.balance += debtor.amount;
      buyerAcc.balance -= debtor.amount;
      // in case the debtor is not seller
      if (debtor.name != sellerName) {
        sellerAcc.transactions.sendTransactions.push({
          name: debtor.name,
          amount: debtor.amount,
        });
        debtorAcc.transactions.receiverTransactions.push({
          name: buyerName,
          amount: debtor.amount,
        });
      } else {
        // in case the debtor is seller
        debtorAcc.transactions.receiverTransactions.push({
          name: sellerAcc.name,
          amount: debtor.amount,
        });
      }
      // dealing with debitors and creditors:
      debtorAcc.creditors.foreach((entry) => {
        // find will check if the debtor is actually debtor or not
        let find = false;
        if (entry.name == sellerName) {
          find = true;
          let amount = entry.amount - debtor.amount;
          if (amount >= 0) {
            entry.amount = amount;
          } else {
            // it means the amount paid was more then the actual amount
            // therefore he/she become creditor for seller
            entry.amount = 0;
            sellerAcc.creditors.push({
              name: entry.name,
              amount: amount * -1, // will make it positive if is negative
            });
          }
        }
        // if the money is sended but the entry is not in debtors
        if (!find) {
          // he/she become creditor to buyer
          sellerAcc.creditors.push({
            name: debtor.name,
            amount: debtor.amount,
          });
        }
      });
      await debtorAcc.save();
    }
  } else if (payingMethod == "unpaid") {
    sellerAcc.creditors.push({
      name: buyerName,
      amount: totalAmount,
    });
    buyerAcc.debitors.push({
      name: sellerName,
      amount: totalAmount,
    });
  }
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
