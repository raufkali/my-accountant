const Order = require("../models/Order");
// Create Order
const createOrder = async (data) => {
  try {
    const { name, rate, quantity, status } = data;

    if (!name || rate == null || quantity == null) {
      console.error("All fields are mandatory!");
      return null;
    }

    const total = rate * quantity;

    const newOrder = await Order.create({
      name,
      rate,
      quantity,
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

    // Force "true"/"false" strings into real booleans
    const updated = await Order.findByIdAndUpdate(
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

    if (!updated) {
      console.error("Order not found");
      return null;
    }

    return updated;
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
