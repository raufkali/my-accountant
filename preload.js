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
});
