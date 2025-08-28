const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // Orders
  orders: {
    getAll: (userId) => ipcRenderer.invoke("orders:getAll", { userId }),
    create: (userId, orderData) =>
      ipcRenderer.invoke("orders:create", { userId, orderData }),
    delete: (userId, id) => ipcRenderer.invoke("orders:delete", { userId, id }),
    update: (userId, id, updateData) =>
      ipcRenderer.invoke("orders:update", { userId, id, updateData }),
    complete: (userId, data) =>
      ipcRenderer.invoke("orders:complete", { userId, data }),
  },

  // Accounts
  accounts: {
    getAll: (userId) => ipcRenderer.invoke("accounts:getAll", { userId }),
    getById: (userId, id) =>
      ipcRenderer.invoke("accounts:getById", { userId, id }),
    create: (userId, data) =>
      ipcRenderer.invoke("accounts:create", { userId, accountData: data }),
    update: (userId, id, data) =>
      ipcRenderer.invoke("accounts:update", { userId, id, updateData: data }),
    delete: (userId, id) =>
      ipcRenderer.invoke("accounts:delete", { userId, id }),
    addTransaction: (userId, accountId, type, transaction) =>
      ipcRenderer.invoke("accounts:addTransaction", {
        userId,
        accountId,
        type,
        transaction,
      }),
    removeTransaction: (userId, id, type, transId) =>
      ipcRenderer.invoke("accounts:removeTransaction", {
        userId,
        id,
        type,
        transId,
      }),
  },

  // Sells
  sells: {
    getAll: (userId) => ipcRenderer.invoke("sells:getAll", { userId }),
    create: (userId, sellData) =>
      ipcRenderer.invoke("sells:create", { userId, sellData }),
    delete: (userId, id) =>
      ipcRenderer.invoke("sells:delete", { userId, sellId: id }),
  },

  // Buys
  buys: {
    getAll: (userId) => ipcRenderer.invoke("buys:getAll", { userId }),
    create: (userId, buyData) =>
      ipcRenderer.invoke("buys:create", { userId, buyData }),
    delete: (userId, id) =>
      ipcRenderer.invoke("buys:delete", { userId, buyId: id }),
  },

  // Sends
  sends: {
    getAll: (userId) => ipcRenderer.invoke("sends:getAll", { userId }),
    create: (userId, sendData) =>
      ipcRenderer.invoke("sends:create", { userId, sendData }),
    delete: (userId, id) =>
      ipcRenderer.invoke("sends:delete", { userId, sendId: id }),
  },

  // Receives
  receives: {
    getAll: (userId) => ipcRenderer.invoke("receives:getAll", { userId }),
    create: (userId, receiveData) =>
      ipcRenderer.invoke("receives:create", { userId, receiveData }),
    delete: (userId, id) =>
      ipcRenderer.invoke("receives:delete", { userId, receiveId: id }),
  },

  // Users
  registerUser: (data) => ipcRenderer.invoke("user:register", data),
  loginUser: (data) => ipcRenderer.invoke("user:login", data),
  updateUser: (data) => ipcRenderer.invoke("user:update", data),
  deleteUser: (id) => ipcRenderer.invoke("user:delete", id),
});
