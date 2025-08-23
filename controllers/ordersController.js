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

      // Helper to fetch account safely
      const getAccount = async (name) => {
        if (!name) return null;
        return await Account.findOne({ name });
      };

      const orderFromAcc = await getAccount(orderFromName);
      const orderToAcc = await getAccount(orderToName);
      const receiverAcc = await getAccount(receiverName);

      // Rollback product transfer
      if (receiverAcc) {
        receiverAcc.product -= completionQuantity;
        await receiverAcc.save();
      }
      if (orderFromAcc) {
        orderFromAcc.product += completionQuantity;
        await orderFromAcc.save();
      }

      // Rollback balances
      if (pay) {
        if (orderFromAcc) {
          orderFromAcc.balance -= completionAmount;
          await orderFromAcc.save();
        }
        if (orderToAcc) {
          orderToAcc.balance += completionAmount;
          await orderToAcc.save();
        }
      } else {
        // Remove creditors and debitors entries linked to this trx
        if (orderToAcc) {
          orderToAcc.transactions.creditors =
            orderToAcc.transactions.creditors.filter(
              (c) => String(c.trxId) !== String(deletedOrder._id)
            );
          await orderToAcc.save();
        }
        if (orderFromAcc) {
          orderFromAcc.transactions.debitors =
            orderFromAcc.transactions.debitors.filter(
              (d) => String(d.trxId) !== String(deletedOrder._id)
            );
          await orderFromAcc.save();
        }
      }

      // Remove transaction history from all accounts
      const removeTransactions = (account, field) => {
        if (!account) return;
        account.transactions[field] = account.transactions[field].filter(
          (trx) => String(trx.trxId) !== String(deletedOrder._id)
        );
      };

      if (orderFromAcc) {
        removeTransactions(orderFromAcc, "sellTransactions");
        await orderFromAcc.save();
      }
      if (orderToAcc) {
        removeTransactions(orderToAcc, "buyTransactions");
        await orderToAcc.save();
      }
      if (receiverAcc) {
        removeTransactions(receiverAcc, "receiverTransactions");
        await receiverAcc.save();
      }
    }

    console.log("Order deleted and rolled back:", deletedOrder._id);
    return deletedOrder;
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
