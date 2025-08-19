const Transaction = require("../models/Transaction");

const getAllTransactions = async () => {
  try {
    const allTrx = await Transaction.find();
    return allTrx;
  } catch (error) {
    console.error(error.message);
    return;
  }
};
