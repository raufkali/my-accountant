const { ipcMain } = require("electron");
const ordersController = require("./controllers/ordersController");
const accountController = require("./controllers/accountController");
const personController = require("./controllers/personController");
const serialize = (data) => JSON.parse(JSON.stringify(data));
const accountController = require("../controllers/accountController");
const sellController = require("../controllers/sellController");

// Orders handlers
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
  serialize(await accountController.getAccountById({ params: { id } }))
);

ipcMain.handle("accounts:create", async (_, accountData) =>
  serialize(await accountController.createAccount({ body: accountData }))
);

ipcMain.handle("accounts:update", async (_, id, updateData) =>
  serialize(
    await accountController.updateAccount({ params: { id }, body: updateData })
  )
);

ipcMain.handle("accounts:delete", async (_, id) =>
  serialize(await accountController.deleteAccount({ params: { id } }))
);

// ─── Transactions ──────────────────────────
ipcMain.handle("accounts:addTransaction", async (_, id, type, txData) =>
  serialize(
    await accountController.addTransaction({
      params: { id, type },
      body: txData,
    })
  )
);

ipcMain.handle("accounts:removeTransaction", async (_, id, type, transId) =>
  serialize(
    await accountController.removeTransaction({ params: { id, type, transId } })
  )
);
ipcMain.handle("person:create", async (_, personData) => {
  const person = await personController.createPerson(personData);
  return serialize(person);
});

ipcMain.handle("person:getAll", async () => {
  const persons = await personController.getAllPersons();
  return serialize(persons);
});

ipcMain.handle("person:getById", async (_, id) => {
  const person = await personController.getPersonById(id);
  return serialize(person);
});

ipcMain.handle("person:update", async (_, id, personData) => {
  const updated = await personController.updatePerson(id, personData);
  return serialize(updated);
});

ipcMain.handle("person:delete", async (_, id) => {
  const deleted = await personController.deletePerson(id);
  return serialize(deleted);
});

// Get all accounts
ipcMain.handle("accounts:getAll", async () => {
  const accounts = await accountController.getAllAccounts();
  return serialize(accounts);
});

// Get account by ID
ipcMain.handle("accounts:getById", async (_, accountId) => {
  const account = await accountController.getAccountById(accountId);
  return serialize(account);
});

// Create account
ipcMain.handle("accounts:create", async (_, accountData) => {
  const newAccount = await accountController.createAccount(accountData);
  return serialize(newAccount);
});

// Add transaction
ipcMain.handle(
  "accounts:addTransaction",
  async (_, { accountId, type, transaction }) => {
    const updated = await accountController.addTransaction(
      accountId,
      type,
      transaction
    );
    return serialize(updated);
  }
);

// Delete account
ipcMain.handle("accounts:delete", async (_, accountId) => {
  const deleted = await accountController.deleteAccount(accountId);
  return serialize(deleted);
});

ipcMain.handle("sells:getAll", async () => {
  const sells = await sellController.getAllSells();
  return serialize(sells);
});

ipcMain.handle("sells:create", async (_, sellData) => {
  const newSell = await sellController.createSell(sellData);
  return serialize(newSell);
});
