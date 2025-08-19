const Account = require("../models/Account");

// Create new account
const createAccount = async (data) => {
  const { name, balance } = data;
  if (!name || balance == null)
    throw new Error("Name and balance are required");

  const account = new Account({ name, balance, transactions: {} });
  return await account.save();
};

// Get all accounts
const getAllAccounts = async () => {
  return await Account.find();
};

// Get single account by ID
const getAccountById = async (id) => {
  return await Account.findById(id);
};

// Add transaction (type: send, sell, receive, buy)
const addTransaction = async (accountId, type, transaction) => {
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  if (!account.transactions[type + "Transactions"]) {
    throw new Error("Invalid transaction type");
  }

  account.transactions[type + "Transactions"].push(transaction);

  // Update balance depending on transaction type
  if (type === "send" || type === "sell") {
    account.balance -= transaction.amount;
  } else if (type === "receiver" || type === "buy") {
    account.balance += transaction.amount;
  }

  return await account.save();
};

// Delete account
const deleteAccount = async (id) => {
  return await Account.findByIdAndDelete(id);
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  addTransaction,
  deleteAccount,
};
