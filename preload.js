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

  // Persons
  persons: {
    create: (data) => ipcRenderer.invoke("person:create", data),
    getAll: () => ipcRenderer.invoke("person:getAll"),
    getById: (id) => ipcRenderer.invoke("person:getById", id),
    update: (id, data) => ipcRenderer.invoke("person:update", id, data),
    delete: (id) => ipcRenderer.invoke("person:delete", id),
  },

  // Sells
  sells: {
    getAll: () => ipcRenderer.invoke("sells:getAll"),
    create: (sellData) => ipcRenderer.invoke("sells:create", sellData),
  },

  // Buys
  buys: {
    getAll: () => ipcRenderer.invoke("buys:getAll"),
    create: (buyData) => ipcRenderer.invoke("buys:create", buyData),
  },

  // Sends
  sends: {
    getAll: () => ipcRenderer.invoke("sends:getAll"),
    create: (sendData) => ipcRenderer.invoke("sends:create", sendData),
  },

  // Receives
  receives: {
    getAll: () => ipcRenderer.invoke("receives:getAll"),
    create: (receiveData) => ipcRenderer.invoke("receives:create", receiveData),
  },
});
