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
    const completionQuantity = Number(quantity);
    const completionRate = Number(rate);
    const completionAmount = completionQuantity * completionRate;

    const order = await Order.findById(id);
    if (!order) {
      console.error("Order not found");
      return null;
    }

    const orderBy = order.orderBy;
    const orderTo = order.orderTo;

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        completionQuantity,
        completionRate,
        completionAmount,
        receiver: String(receiver).trim(),
        status: "completed",
        pay,
      },
      { new: true }
    ).lean();

    // Ensure accounts exist
    let orderByAcc = await Account.findOne({ name: orderBy });
    if (!orderByAcc) {
      orderByAcc = await Account.create({
        name: orderBy,
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

    let orderToAcc = await Account.findOne({ name: orderTo });
    if (!orderToAcc) {
      orderToAcc = await Account.create({
        name: orderTo,
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

    let receiverAcc = await Account.findOne({ name: receiver });
    if (!receiverAcc) {
      receiverAcc = await Account.create({
        name: receiver,
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

    // Products are with receiver
    receiverAcc.product += completionQuantity;

    // Handle orderBy
    if (pay) {
      orderByAcc.balance += completionAmount; // Paid → add balance
    } else {
      // Not paid → receiver becomes creditor
      receiverAcc.creditors.push({
        name: orderBy,
        amount: completionAmount,
        trxId: updatedOrder._id,
        note: "Unpaid order received",
      });
      orderByAcc.debitors.push({
        name: receiver,
        amount: completionAmount,
        trxId: updatedOrder._id,
        note: "Receiver is creditor for unpaid order",
      });
    }

    // Transactions
    orderByAcc.sellTransactions.push({
      name: receiver,
      amount: completionAmount,
      trxId: updatedOrder._id,
      note: pay ? "Order paid" : "Order unpaid",
    });

    orderToAcc.buyTransactions.push({
      name: receiver,
      amount: completionAmount,
      trxId: updatedOrder._id,
      note: "Order received",
    });

    receiverAcc.receiverTransactions.push({
      name: orderBy,
      amount: completionAmount,
      trxId: updatedOrder._id,
      note: "Products received",
    });

    // Save all
    await orderByAcc.save();
    await orderToAcc.save();
    await receiverAcc.save();

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
