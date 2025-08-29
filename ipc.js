const { ipcMain } = require("electron");
const mongoose = require("mongoose");
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

// ─── Helpers ───────────────────────────────
const toObjectId = (id) => {
  if (!id) return null;
  return new mongoose.Types.ObjectId(String(id));
};

const serialize = (data) => JSON.parse(JSON.stringify(data));

// ─── Orders ───────────────────────────────
ipcMain.handle("orders:getAll", async (_, { userId }) =>
  serialize(await ordersController.getAllOrders(toObjectId(userId)))
);

ipcMain.handle("orders:create", async (_, { userId, orderData }) =>
  serialize(await ordersController.createOrder(toObjectId(userId), orderData))
);

ipcMain.handle("orders:delete", async (_, { userId, id }) =>
  serialize(await ordersController.deleteOrder(toObjectId(userId), id))
);

ipcMain.handle("orders:update", async (_, { userId, id, updateData }) =>
  serialize(
    await ordersController.updateOrder(toObjectId(userId), id, updateData)
  )
);

ipcMain.handle("orders:complete", async (_, { userId, data }) =>
  serialize(await ordersController.completeOrder(toObjectId(userId), data))
);

// ─── Accounts ───────────────────────────────
ipcMain.handle("accounts:getAll", async (_, { userId }) =>
  serialize(await accountController.getAllAccounts(toObjectId(userId)))
);

ipcMain.handle("accounts:getById", async (_, { userId, id }) =>
  serialize(await accountController.getAccountById(toObjectId(userId), id))
);

ipcMain.handle("accounts:create", async (_, { userId, accountData }) =>
  serialize(
    await accountController.createAccount(toObjectId(userId), accountData)
  )
);

ipcMain.handle("accounts:update", async (_, { userId, id, updateData }) =>
  serialize(
    await accountController.updateAccount(toObjectId(userId), id, updateData)
  )
);

ipcMain.handle("accounts:delete", async (_, { userId, id }) =>
  serialize(await accountController.deleteAccount(toObjectId(userId), id))
);

ipcMain.handle(
  "accounts:addTransaction",
  async (_, { userId, accountId, type, transaction }) =>
    serialize(
      await accountController.addTransaction(
        toObjectId(userId),
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
      await accountController.removeTransaction(
        toObjectId(userId),
        id,
        type,
        transId
      )
    )
);

// ─── Sells ───────────────────────────────
ipcMain.handle("sells:getAll", async (_, { userId }) =>
  serialize(await sellController.getAllSells(toObjectId(userId)))
);

ipcMain.handle("sells:create", async (_, { userId, sellData }) =>
  serialize(await sellController.createSell(toObjectId(userId), sellData))
);

ipcMain.handle("sells:delete", async (_, { userId, sellId }) =>
  serialize(await sellController.deleteSell(toObjectId(userId), sellId))
);

// ─── Buys ───────────────────────────────
ipcMain.handle("buys:getAll", async (_, { userId }) =>
  serialize(await buyController.getAllBuys(toObjectId(userId)))
);

ipcMain.handle("buys:create", async (_, { userId, buyData }) =>
  serialize(await buyController.createBuy(toObjectId(userId), buyData))
);

ipcMain.handle("buys:delete", async (_, { userId, buyId }) =>
  serialize(await buyController.deleteBuy(toObjectId(userId), buyId))
);

// ─── Sends ───────────────────────────────
ipcMain.handle("sends:getAll", async (_, { userId }) =>
  serialize(await sendController.getAllSends(toObjectId(userId)))
);

ipcMain.handle("sends:create", async (_, { userId, sendData }) =>
  serialize(await sendController.createSend(toObjectId(userId), sendData))
);

ipcMain.handle("sends:delete", async (_, { userId, sendId }) =>
  serialize(await sendController.deleteSend(toObjectId(userId), sendId))
);

// ─── Receives ───────────────────────────────
ipcMain.handle("receives:getAll", async (_, { userId }) =>
  serialize(await receiveController.getAllReceives(toObjectId(userId)))
);

ipcMain.handle("receives:create", async (_, { userId, receiveData }) =>
  serialize(
    await receiveController.createReceive(toObjectId(userId), receiveData)
  )
);

ipcMain.handle("receives:delete", async (_, { userId, receiveId }) =>
  serialize(
    await receiveController.deleteReceive(toObjectId(userId), receiveId)
  )
);

// ─── User Auth ───────────────────────────────
ipcMain.handle("user:register", registerUser);
ipcMain.handle("user:login", loginUser);
ipcMain.handle("user:update", updateUser);
ipcMain.handle("user:delete", deleteUser);
