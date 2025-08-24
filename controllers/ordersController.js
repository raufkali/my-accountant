const Order = require("../models/Order");
const Account = require("../models/Account");
// Create Order
const createOrder = async (data) => {
  console.log(data);
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

    return newOrder.toObject(); // plain JS object
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

// Delete Order
// Delete Order
const deleteOrder = async (id) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(id).lean();

    if (!deletedOrder) {
      console.error("Order not found");
      return null;
    }

    // If order was completed, rollback accounts
    if (deletedOrder.status === "completed") {
      const {
        completionQuantity,
        completionAmount,
        orderFrom,
        orderTo,
        receiver,
        pay,
      } = deletedOrder;

      const orderFromName = orderFrom?.toLowerCase();
      const orderToName = orderTo?.toLowerCase();
      const receiverName = receiver?.toLowerCase();
      const isPaid = String(pay).toLowerCase() === "yes";

      // Helper to fetch account safely
      const getAccount = async (name) => {
        if (!name) return null;
        return await Account.findOne({ name });
      };

      const orderFromAcc = await getAccount(orderFromName);
      const orderToAcc = await getAccount(orderToName);
      const receiverAcc = await getAccount(receiverName);

      // --------- Rollback product transfer ------------
      if (receiverAcc) {
        receiverAcc.product -= completionQuantity;
      }
      if (orderFromAcc) {
        orderFromAcc.product += completionQuantity;
      }

      // --------- Rollback balances ------------
      if (isPaid) {
        if (orderFromAcc) orderFromAcc.balance -= completionAmount;
        if (orderToAcc) orderToAcc.balance += completionAmount;
      } else {
        // Remove creditors/debitors created in completeOrder
        if (orderFromAcc) {
          orderFromAcc.creditors = orderFromAcc.creditors.filter(
            (c) => String(c.trxId) !== String(deletedOrder._id)
          );
        }
        if (orderToAcc) {
          orderToAcc.debitors = orderToAcc.debitors.filter(
            (d) => String(d.trxId) !== String(deletedOrder._id)
          );
        }
      }

      // --------- Rollback normal transactions ------------
      const removeTransactions = (account, field) => {
        if (!account) return;
        account.transactions[field] = account.transactions[field].filter(
          (trx) => String(trx.trxId) !== String(deletedOrder._id)
        );
      };

      if (orderFromAcc) {
        removeTransactions(orderFromAcc, "sellTransactions");
      }
      if (orderToAcc) {
        removeTransactions(orderToAcc, "buyTransactions");
      }
      if (receiverAcc) {
        removeTransactions(receiverAcc, "receiverTransactions");
      }

      // --------- Rollback extra linkage ------------
      if (orderToAcc) {
        orderToAcc.creditors = orderToAcc.creditors.filter(
          (c) =>
            String(c.trxId) !== String(deletedOrder._id) &&
            c.name !== receiverName &&
            c.product !== completionQuantity
        );
      }

      if (receiverAcc) {
        receiverAcc.debitors = receiverAcc.debitors.filter(
          (d) =>
            String(d.trxId) !== String(deletedOrder._id) &&
            d.name !== orderToName &&
            d.product !== completionQuantity
        );
      }

      // --------- Save all accounts ------------
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

// Get Order by ID
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

// Get All Orders
const getAllOrders = async () => {
  try {
    return await Order.find().lean(); // returns plain JS objects
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Update Order
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

const completeOrder = async ({ id, quantity, rate, receiver, pay }) => {
  try {
    // Ensure numeric values
    const completionQuantity = Number(quantity);
    const completionRate = Number(rate);
    const completionAmount = completionQuantity * completionRate;

    // Normalize pay flag
    const isPaid = String(pay).toLowerCase() === "yes";

    // Ensure essential inputs (don’t reject 0)
    if (
      !id ||
      completionQuantity == null ||
      completionRate == null ||
      !receiver
    ) {
      throw new Error("Missing required fields for completing order");
    }

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Order participants
    const orderFrom = order.orderFrom.toLowerCase();
    const orderTo = order.orderTo.toLowerCase();
    const receiverName = String(receiver).trim().toLowerCase();

    // Update order status
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

    // Helper to ensure account existence using upsert
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

    // Get or create accounts
    const orderFromAcc = await ensureAccount(orderFrom);
    const orderToAcc = await ensureAccount(orderTo);
    const receiverAcc = await ensureAccount(receiverName);

    if (!receiverAcc) {
      throw new Error("Receiver account could not be created");
    }

    // Check stock before transferring products

    // --------- Product Movement ------------
    receiverAcc.product += completionQuantity;
    orderFromAcc.product -= completionQuantity;

    // --------- Money Handling ------------
    if (isPaid) {
      orderFromAcc.balance += completionAmount; // seller gets money
      orderToAcc.balance -= completionAmount; // buyer pays money
    } else {
      // Record debts
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

    receiverAcc.transactions.receiverTransactions.push({
      name: orderFrom,
      amount: completionAmount,
      trxId: updatedOrder._id,
      product: completionQuantity,

      note: "Products received",
    });

    // Receiver & buyer linkage (products)
    orderToAcc.creditors.push({
      name: receiverName,
      product: completionQuantity,
      note: "Receiver got products",
    });

    receiverAcc.debitors.push({
      name: orderTo,
      product: completionQuantity,
      note: "Received products",
    });

    // --------- Save Accounts ------------
    await orderFromAcc.save();
    await orderToAcc.save();
    await receiverAcc.save();

    return updatedOrder;
  } catch (err) {
    console.error("Error completing order:", err.message);
    throw err; // throw instead of silently returning null
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
