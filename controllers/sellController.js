const Sell = require("../models/SellTrx");
const Account = require("../models/Account");

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
// Delete a Sell Transaction
const deleteSell = async (sellId) => {
  const sellTxn = await Sell.findById(sellId);
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
  const sellerAcc = await getOrCreateAccount(sellerName);
  const buyerAcc = await getOrCreateAccount(buyerName);

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
      const debtorAcc = await getOrCreateAccount(debtor.name);

      debtorAcc.balance -= debtor.amount;
      buyerAcc.balance += debtor.amount;

      // Remove references
      sellerAcc.transactions.sendTransactions =
        sellerAcc.transactions.sendTransactions.filter(
          (t) => t.trxId.toString() !== sellId.toString()
        );
      debtorAcc.transactions.receiverTransactions =
        debtorAcc.transactions.receiverTransactions.filter(
          (t) => t.trxId.toString() !== sellId.toString()
        );

      // Revert creditors/debitors relation
      sellerAcc.creditors = sellerAcc.creditors.filter(
        (c) => c.trxId.toString() !== sellId.toString()
      );
      debtorAcc.creditors = debtorAcc.creditors.filter(
        (c) => c.trxId.toString() !== sellId.toString()
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

  // 5. Finally delete sell transaction
  await Sell.findByIdAndDelete(sellId);

  return { message: "Sell transaction deleted successfully" };
};

module.exports = {
  createSell,
  getAllSells,
  deleteSell,
};
