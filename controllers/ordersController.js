const Order = require("../models/Order");
const Account = require("../models/Account");

// -------------------- Create Order --------------------
const createOrder = async (data) => {
  try {
    const { orderFrom, orderTo, rate, quantity, status } = data;
    if (!orderFrom || !orderTo || rate == null || quantity == null) {
      console.error("All fields are mandatory!");
      return null;
    }
    const total = rate * quantity;

    const newOrder = await Order.create({
      orderFrom,
      orderTo,
      quantity,
      rate,
      total,
      status: status || "pending",
    });

    return newOrder.toObject();
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

// -------------------- Delete Order (Rollback) --------------------
const deleteOrder = async (id) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(id).lean();
    if (!deletedOrder) {
      console.error("Order not found");
      return null;
    }

    if (deletedOrder.status === "completed") {
      const {
        completionQuantity = 0,
        completionAmount = 0,
        orderFrom,
        orderTo,
        receiver,
        pay,
      } = deletedOrder;

      const orderFromName = orderFrom?.toLowerCase();
      const orderToName = orderTo?.toLowerCase();
      const receiverName = receiver?.toLowerCase();
      const isPaid = String(pay).toLowerCase() === "yes";

      // Helper
      const getAccount = async (name) =>
        name ? await Account.findOne({ name }) : null;

      const orderFromAcc = await getAccount(orderFromName);
      const orderToAcc = await getAccount(orderToName);
      const receiverAcc = await getAccount(receiverName);

      // --------- Rollback products ------------
      if (receiverAcc) receiverAcc.product -= completionQuantity;
      if (orderFromAcc) orderFromAcc.product += completionQuantity;

      // --------- Rollback balances / debts ------------
      if (isPaid) {
        orderFromAcc.balance -= completionAmount;
        orderToAcc.balance += completionAmount;
      } else {
        orderFromAcc.creditors = orderFromAcc.creditors.filter(
          (c) => String(c.trxId) !== String(deletedOrder._id)
        );
        orderToAcc.debitors = orderToAcc.debitors.filter(
          (d) => String(d.trxId) !== String(deletedOrder._id)
        );
      }

      // --------- Rollback transactions ------------
      const removeTransactions = (account, field) => {
        if (!account) return;
        account.transactions[field] = account.transactions[field].filter(
          (trx) => String(trx.trxId) !== String(deletedOrder._id)
        );
      };

      if (orderFromAcc) removeTransactions(orderFromAcc, "sellTransactions");
      if (orderToAcc) removeTransactions(orderToAcc, "buyTransactions");
      if (receiverAcc) removeTransactions(receiverAcc, "receiverTransactions");

      // --------- Rollback extra product linkage ------------
      if (receiverName !== orderToName) {
        orderToAcc.creditors = orderToAcc.creditors.filter(
          (c) =>
            String(c.trxId) !== String(deletedOrder._id) &&
            c.name !== receiverName
        );
        receiverAcc.debitors = receiverAcc.debitors.filter(
          (d) =>
            String(d.trxId) !== String(deletedOrder._id) &&
            d.name !== orderToName
        );
      }

      // Save
      if (orderFromAcc) await orderFromAcc.save();
      if (orderToAcc) await orderToAcc.save();
      if (receiverAcc) await receiverAcc.save();
    }

    console.log("Order deleted and rolled back:", deletedOrder._id);
    return deletedOrder;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// -------------------- Get Order by ID --------------------
const getOrderById = async (id) => {
  try {
    const order = await Order.findById(id).lean();
    if (!order) {
      console.error("Order not found");
      return null;
    }
    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

// -------------------- Get All Orders --------------------
const getAllOrders = async () => {
  try {
    return await Order.find().lean();
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// -------------------- Update Order --------------------
const updateOrder = async (id, updateData) => {
  try {
    const updated = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();
    if (!updated) {
      console.error("Order not found");
      return null;
    }
    return updated;
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
};

// -------------------- Complete Order --------------------
const completeOrder = async ({ id, quantity, rate, receiver, pay }) => {
  try {
    const completionQuantity = Number(quantity);
    const completionRate = Number(rate);
    const completionAmount = completionQuantity * completionRate;
    const isPaid = String(pay).toLowerCase() === "yes";

    if (
      !id ||
      completionQuantity == null ||
      completionRate == null ||
      !receiver
    ) {
      throw new Error("Missing required fields for completing order");
    }

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    const orderFrom = order.orderFrom.toLowerCase();
    const orderTo = order.orderTo.toLowerCase();
    const receiverName = String(receiver).trim().toLowerCase();

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        completionQuantity,
        completionRate,
        completionAmount,
        receiver: receiverName,
        status: "completed",
        pay: isPaid ? "yes" : "no",
      },
      { new: true, runValidators: true }
    ).lean();
    if (receiverName === orderFrom) {
      return new Error("This person can't be reciever");
    }
    const ensureAccount = async (name) => {
      if (!name) return null;
      return await Account.findOneAndUpdate(
        { name },
        {
          $setOnInsert: {
            balance: 0,
            product: 0,
            transactions: {
              sendTransactions: [],
              sellTransactions: [],
              receiverTransactions: [],
              buyTransactions: [],
            },
            debitors: [],
            creditors: [],
          },
        },
        { new: true, upsert: true }
      );
    };

    const orderFromAcc = await ensureAccount(orderFrom);
    const orderToAcc = await ensureAccount(orderTo);
    const receiverAcc = await ensureAccount(receiverName);

    if (!receiverAcc) throw new Error("Receiver account could not be created");

    // --------- Product Movement ------------
    receiverAcc.product += completionQuantity;
    orderFromAcc.product -= completionQuantity;

    // --------- Money Handling ------------
    if (isPaid) {
      orderFromAcc.balance += completionAmount;
      orderToAcc.balance -= completionAmount;
    } else {
      orderFromAcc.creditors.push({
        name: orderTo,
        amount: completionAmount,
        product: completionQuantity,
        trxId: updatedOrder._id,
        note: "Product deducted but payment not received",
      });
      orderToAcc.debitors.push({
        name: orderFrom,
        product: completionQuantity,
        amount: completionAmount,
        trxId: updatedOrder._id,
        note: "Order giver is debitor for unpaid order",
      });
    }

    // --------- Transactions Logging ------------
    orderFromAcc.transactions.sellTransactions.push({
      name: orderTo,
      amount: completionAmount,
      product: completionQuantity,
      trxId: updatedOrder._id,
      note: isPaid ? "Order paid" : "Order unpaid",
    });
    orderToAcc.transactions.buyTransactions.push({
      name: orderFrom,
      amount: completionAmount,
      product: completionQuantity,
      trxId: updatedOrder._id,
      note: "Order received",
    });

    if (receiverName !== orderTo) {
      receiverAcc.transactions.receiverTransactions.push({
        name: orderFrom,
        amount: 0,
        trxId: updatedOrder._id,
        product: completionQuantity,
        note: "Products received",
      });

      orderToAcc.creditors.push({
        name: receiverName,
        product: completionQuantity,
        trxId: updatedOrder._id,
        note: "Receiver got products",
      });

      receiverAcc.debitors.push({
        name: orderTo,
        product: completionQuantity,
        trxId: updatedOrder._id,
        note: "Received products",
      });
    }

    await orderFromAcc.save();
    await orderToAcc.save();
    await receiverAcc.save();

    return updatedOrder;
  } catch (err) {
    console.error("Error completing order:", err.message);
    throw err;
  }
};

module.exports = {
  createOrder,
  deleteOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  completeOrder,
};
