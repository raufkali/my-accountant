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
const deleteOrder = async (id) => {
  try {
    const deleted = await Order.findByIdAndDelete(id).lean();
    if (!deleted) {
      console.error("Order not found");
      return null;
    }
    return deleted;
  } catch (error) {
    console.error("Error deleting order:", error);
    return null;
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

    if (!id || !completionQuantity || !completionRate || !receiver) {
      console.error("Missing required fields for completing order");
      return null;
    }

    const order = await Order.findById(id);
    if (!order) {
      console.error("Order not found");
      return null;
    }

    const orderFrom = order.orderFrom;
    const orderTo = order.orderTo;
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
        pay,
      },
      { new: true, runValidators: true }
    ).lean();

    // Helper to initialize account if missing
    const ensureAccount = async (name) => {
      if (!name) return null;
      let acc = await Account.findOne({ name });
      if (!acc) {
        acc = await Account.create({
          name,
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
        });
      }
      return acc;
    };

    const orderFromAcc = await ensureAccount(orderFrom);
    const orderToAcc = await ensureAccount(orderTo);
    const receiverAcc = await ensureAccount(receiverName);

    if (!receiverAcc) {
      console.error("Receiver account could not be created");
      return null;
    }

    // Products are with receiver
    receiverAcc.product += completionQuantity;
    orderFromAcc.product -= completionQuantity;

    // Handle balances and debts
    if (pay) {
      if (orderFromAcc) {
        orderFromAcc.balance += completionAmount;
        orderToAcc.balance -= completionAmount;
      }
      // Paid → add balance
    } else {
      if (receiverAcc && orderFromAcc) {
        orderToAcc.transactions.creditors.push({
          name: orderTo,
          amount: completionAmount,
          trxId: updatedOrder._id,
          note: "product deducted but payment not recieved",
        });

        orderFromAcc.transactions.debitors.push({
          name: orderFrom,
          amount: completionAmount,
          trxId: updatedOrder._id,
          note: "Order Giver is Debitor for unpaid order",
        });
      }
    }

    // Transactions
    if (orderFromAcc) {
      orderFromAcc.transactions.sellTransactions.push({
        name: receiverName,
        amount: completionAmount,
        trxId: updatedOrder._id,
        note: pay ? "Order paid" : "Order unpaid",
      });
      await orderFromAcc.save();
    }

    if (orderToAcc) {
      orderToAcc.transactions.buyTransactions.push({
        name: receiverName,
        amount: completionAmount,
        trxId: updatedOrder._id,
        note: "Order received",
      });
      await orderToAcc.save();
    }

    if (receiverAcc) {
      receiverAcc.transactions.receiverTransactions.push({
        name: orderFrom,
        amount: completionAmount,
        trxId: updatedOrder._id,
        note: "Products received",
      });
      await receiverAcc.save();
    }

    return updatedOrder;
  } catch (err) {
    console.error("Error completing order:", err);
    return null;
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
