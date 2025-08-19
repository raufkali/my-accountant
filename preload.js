const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getOrders: () => ipcRenderer.invoke("orders:getAll"),
  addOrder: (order) => ipcRenderer.invoke("orders:create", order),
  deleteOrder: (id) => ipcRenderer.invoke("orders:delete", id),
  updateOrder: (id, updateData) =>
    ipcRenderer.invoke("orders:update", id, updateData),
  completeOrder: (data) =>
    ipcRenderer.invoke("orders:complete", {
      id: data.id,
      quantity: data.quantity,
      rate: data.rate,
      receiver: data.receiver,
      pay: data.pay,
    }),
  getAllAccounts: () => ipcRenderer.invoke("accounts:getAll"),
  getAccountById: (id) => ipcRenderer.invoke("accounts:getById", id),
  createAccount: (accountData) =>
    ipcRenderer.invoke("accounts:create", accountData),
  updateAccount: (id, updateData) =>
    ipcRenderer.invoke("accounts:update", id, updateData),
  deleteAccount: (id) => ipcRenderer.invoke("accounts:delete", id),

  // ─── Transactions ───────────────────────
  addTransaction: (id, type, txData) =>
    ipcRenderer.invoke("accounts:addTransaction", id, type, txData),
  removeTransaction: (id, type, transId) =>
    ipcRenderer.invoke("accounts:removeTransaction", id, type, transId),

  createPerson: (data) => ipcRenderer.invoke("person:create", data),
  getAllPersons: () => ipcRenderer.invoke("person:getAll"),
  getPersonById: (id) => ipcRenderer.invoke("person:getById", id),
  updatePerson: (id, data) => ipcRenderer.invoke("person:update", id, data),
  deletePerson: (id) => ipcRenderer.invoke("person:delete", id),
  accounts: {
    getAll: () => ipcRenderer.invoke("accounts:getAll"),
    getById: (id) => ipcRenderer.invoke("accounts:getById", id),
    create: (accountData) => ipcRenderer.invoke("accounts:create", accountData),
    addTransaction: (accountId, type, transaction) =>
      ipcRenderer.invoke("accounts:addTransaction", {
        accountId,
        type,
        transaction,
      }),
    delete: (id) => ipcRenderer.invoke("accounts:delete", id),
  },
  sells: {
    getAll: () => ipcRenderer.invoke("sells:getAll"),
    create: (sellData) => ipcRenderer.invoke("sells:create", sellData),
  },
});
