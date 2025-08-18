const Account = require("../models/Account");

// Create a new account
const createAccount = async (req, res) => {
  try {
    const { name, balance } = req.body;

    if (!name || balance == null) {
      return res.status(400).json({ error: "Name and balance are required" });
    }

    const account = new Account({
      name,
      balance,
      transactions: {
        sendTransactions: [],
        sellTransactions: [],
        receiverTransactions: [],
        buyTransactions: [],
      },
    });

    await account.save();
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all accounts
const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get account by ID
const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update account (name or balance)
const updateAccount = async (req, res) => {
  try {
    const { name, balance } = req.body;
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { name, balance },
      { new: true }
    );

    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a transaction to specific type
const addTransaction = async (req, res) => {
  try {
    const { type } = req.params; // send, sell, receiver, buy
    const { name, amount } = req.body;

    if (
      ![
        "sendTransactions",
        "sellTransactions",
        "receiverTransactions",
        "buyTransactions",
      ].includes(type)
    ) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    account.transactions[type].push({ name, amount });

    // optionally update balance
    if (type === "sendTransactions" || type === "sellTransactions") {
      account.balance -= amount;
    } else if (type === "receiverTransactions" || type === "buyTransactions") {
      account.balance += amount;
    }

    await account.save();
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a transaction
const removeTransaction = async (req, res) => {
  try {
    const { type, transId } = req.params;

    if (
      ![
        "sendTransactions",
        "sellTransactions",
        "receiverTransactions",
        "buyTransactions",
      ].includes(type)
    ) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });

    account.transactions[type] = account.transactions[type].filter(
      (t) => t._id.toString() !== transId
    );

    await account.save();
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  addTransaction,
  removeTransaction,
};
