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
ipcMain.handle("orders:getAll", async () =>
  serialize(await ordersController.getAllOrders())
);

ipcMain.handle("orders:create", async (_, orderData) =>
  serialize(await ordersController.createOrder(orderData))
);

ipcMain.handle("orders:delete", async (_, id) =>
  serialize(await ordersController.deleteOrder(id))
);

ipcMain.handle("orders:update", async (_, id, updateData) =>
  serialize(await ordersController.updateOrder(id, updateData))
);

ipcMain.handle("orders:complete", async (_, data) =>
  serialize(await ordersController.completeOrder(data))
);

// ─── Accounts ───────────────────────────────
ipcMain.handle("accounts:getAll", async () =>
  serialize(await accountController.getAllAccounts())
);

ipcMain.handle("accounts:getById", async (_, id) =>
  serialize(await accountController.getAccountById(id))
);

ipcMain.handle("accounts:create", async (_, accountData) =>
  serialize(await accountController.createAccount(accountData))
);

ipcMain.handle("accounts:update", async (_, id, updateData) =>
  serialize(await accountController.updateAccount(id, updateData))
);

ipcMain.handle("accounts:delete", async (_, id) =>
  serialize(await accountController.deleteAccount(id))
);

ipcMain.handle(
  "accounts:addTransaction",
  async (_, { accountId, type, transaction }) =>
    serialize(
      await accountController.addTransaction(accountId, type, transaction)
    )
);

ipcMain.handle("accounts:removeTransaction", async (_, { id, type, transId }) =>
  serialize(await accountController.removeTransaction(id, type, transId))
);

// ─── Sells ───────────────────────────────
ipcMain.handle("sells:getAll", async () =>
  serialize(await sellController.getAllSells())
);

ipcMain.handle("sells:create", async (_, sellData) =>
  serialize(await sellController.createSell(sellData))
);

ipcMain.handle("sells:delete", async (_, sellId) =>
  serialize(await sellController.deleteSell(sellId))
);
// ─── Buys ───────────────────────────────
ipcMain.handle("buys:getAll", async () =>
  serialize(await buyController.getAllBuys())
);

ipcMain.handle("buys:create", async (_, buyData) =>
  serialize(await buyController.createBuy(buyData))
);
ipcMain.handle("buys:delete", async (_, buyId) =>
  serialize(await buyController.deleteBuy(buyId))
);

// ─── Sends ───────────────────────────────
ipcMain.handle("sends:getAll", async () =>
  serialize(await sendController.getAllSends())
);

ipcMain.handle("sends:create", async (_, sendData) =>
  serialize(await sendController.createSend(sendData))
);

ipcMain.handle("sends:delete", async (_, sendId) =>
  serialize(await sendController.deleteSend(sendId))
);
// ─── Receives ───────────────────────────────
ipcMain.handle("receives:getAll", async () =>
  serialize(await receiveController.getAllReceives())
);

ipcMain.handle("receives:create", async (_, receiveData) =>
  serialize(await receiveController.createReceive(receiveData))
);

ipcMain.handle("receives:delete", async (_, receiveId) =>
  serialize(await receiveController.deleteReceive(receiveId))
);

// ✅ Register
ipcMain.handle("user:register", registerUser);

// ✅ Login
ipcMain.handle("user:login", loginUser);

// ✅ Update
ipcMain.handle("user:update", updateUser);

// ✅ Delete
ipcMain.handle("user:delete", deleteUser);
