const { ipcMain } = require("electron");
const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
} = require("./controllers/userController");

// Controllers
const ordersController = require("./controllers/ordersController");
const accountController = require("./controllers/accountController");
const sellController = require("./controllers/sellController");
const buyController = require("./controllers/buyController");
const sendController = require("./controllers/sendController");
const receiveController = require("./controllers/recieveController");

// Simple serializer to strip mongoose metadata
const serialize = (data) => JSON.parse(JSON.stringify(data));

// ─── Orders ───────────────────────────────
ipcMain.handle("orders:getAll", async (_, { userId }) =>
  serialize(await ordersController.getAllOrders(userId))
);

ipcMain.handle("orders:create", async (_, { userId, orderData }) =>
  serialize(await ordersController.createOrder(userId, orderData))
);

ipcMain.handle("orders:delete", async (_, { userId, id }) =>
  serialize(await ordersController.deleteOrder(userId, id))
);

ipcMain.handle("orders:update", async (_, { userId, id, updateData }) =>
  serialize(await ordersController.updateOrder(userId, id, updateData))
);

ipcMain.handle("orders:complete", async (_, { userId, data }) =>
  serialize(await ordersController.completeOrder(userId, data))
);

// ─── Accounts ───────────────────────────────
ipcMain.handle("accounts:getAll", async (_, { userId }) =>
  serialize(await accountController.getAllAccounts(userId))
);

ipcMain.handle("accounts:getById", async (_, { userId, id }) =>
  serialize(await accountController.getAccountById(userId, id))
);

ipcMain.handle("accounts:create", async (_, { userId, accountData }) =>
  serialize(await accountController.createAccount(userId, accountData))
);

ipcMain.handle("accounts:update", async (_, { userId, id, updateData }) =>
  serialize(await accountController.updateAccount(userId, id, updateData))
);

ipcMain.handle("accounts:delete", async (_, { userId, id }) =>
  serialize(await accountController.deleteAccount(userId, id))
);

ipcMain.handle(
  "accounts:addTransaction",
  async (_, { userId, accountId, type, transaction }) =>
    serialize(
      await accountController.addTransaction(
        userId,
        accountId,
        type,
        transaction
      )
    )
);

ipcMain.handle(
  "accounts:removeTransaction",
  async (_, { userId, id, type, transId }) =>
    serialize(
      await accountController.removeTransaction(userId, id, type, transId)
    )
);

// ─── Sells ───────────────────────────────
ipcMain.handle("sells:getAll", async (_, { userId }) =>
  serialize(await sellController.getAllSells(userId))
);

ipcMain.handle("sells:create", async (_, { userId, sellData }) =>
  serialize(await sellController.createSell(userId, sellData))
);

ipcMain.handle("sells:delete", async (_, { userId, sellId }) =>
  serialize(await sellController.deleteSell(userId, sellId))
);

// ─── Buys ───────────────────────────────
ipcMain.handle("buys:getAll", async (_, { userId }) =>
  serialize(await buyController.getAllBuys(userId))
);

ipcMain.handle("buys:create", async (_, { userId, buyData }) =>
  serialize(await buyController.createBuy(userId, buyData))
);

ipcMain.handle("buys:delete", async (_, { userId, buyId }) =>
  serialize(await buyController.deleteBuy(userId, buyId))
);

// ─── Sends ───────────────────────────────
ipcMain.handle("sends:getAll", async (_, { userId }) =>
  serialize(await sendController.getAllSends(userId))
);

ipcMain.handle("sends:create", async (_, { userId, sendData }) =>
  serialize(await sendController.createSend(userId, sendData))
);

ipcMain.handle("sends:delete", async (_, { userId, sendId }) =>
  serialize(await sendController.deleteSend(userId, sendId))
);

// ─── Receives ───────────────────────────────
ipcMain.handle("receives:getAll", async (_, { userId }) =>
  serialize(await receiveController.getAllReceives(userId))
);

ipcMain.handle("receives:create", async (_, { userId, receiveData }) =>
  serialize(await receiveController.createReceive(userId, receiveData))
);

ipcMain.handle("receives:delete", async (_, { userId, receiveId }) =>
  serialize(await receiveController.deleteReceive(userId, receiveId))
);

// ✅ Register
ipcMain.handle("user:register", registerUser);

// ✅ Login
ipcMain.handle("user:login", loginUser);

// ✅ Update
ipcMain.handle("user:update", updateUser);

// ✅ Delete
ipcMain.handle("user:delete", deleteUser);
