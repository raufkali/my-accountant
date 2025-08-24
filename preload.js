const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Orders
  orders: {
    getAll: () => ipcRenderer.invoke("orders:getAll"),
    create: (order) => ipcRenderer.invoke("orders:create", order),
    delete: (id) => ipcRenderer.invoke("orders:delete", id),
    update: (id, updateData) =>
      ipcRenderer.invoke("orders:update", id, updateData),
    complete: (data) => ipcRenderer.invoke("orders:complete", data),
  },

  // Accounts
  accounts: {
    getAll: () => ipcRenderer.invoke("accounts:getAll"),
    getById: (id) => ipcRenderer.invoke("accounts:getById", id),
    create: (data) => ipcRenderer.invoke("accounts:create", data),
    update: (id, data) => ipcRenderer.invoke("accounts:update", id, data),
    delete: (id) => ipcRenderer.invoke("accounts:delete", id),
    addTransaction: (accountId, type, transaction) =>
      ipcRenderer.invoke("accounts:addTransaction", {
        accountId,
        type,
        transaction,
      }),
    removeTransaction: (id, type, transId) =>
      ipcRenderer.invoke("accounts:removeTransaction", { id, type, transId }),
  },

  // Sells
  sells: {
    getAll: () => ipcRenderer.invoke("sells:getAll"),
    create: (sellData) => ipcRenderer.invoke("sells:create", sellData),
    delete: (id) => ipcRenderer.invoke("sells:delete", id),
  },

  // Buys
  buys: {
    getAll: () => ipcRenderer.invoke("buys:getAll"),
    create: (buyData) => ipcRenderer.invoke("buys:create", buyData),
    delete: (id) => ipcRenderer.invoke("buys:delete", id),
  },

  // Sends
  sends: {
    getAll: () => ipcRenderer.invoke("sends:getAll"),
    create: (sendData) => ipcRenderer.invoke("sends:create", sendData),
    delete: (id) => ipcRenderer.invoke("sends:delete", id),
  },

  // Receives
  receives: {
    getAll: () => ipcRenderer.invoke("receives:getAll"),
    create: (receiveData) => ipcRenderer.invoke("receives:create", receiveData),
    delete: (id) => ipcRenderer.invoke("receives:delete", id),
  },
});
