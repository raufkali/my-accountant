import React, { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";

// Import child components
import CreateOrderForm from "./orderHandler/CreateOrderForm";
import OrdersSummary from "./orderHandler/OrdersSummary";
import OrderList from "./orderHandler/OrderList";
import ProceedModal from "./orderHandler/ProceedModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  // Totals
  const totPending = orders
    .filter((order) => order.status === "pending")
    .reduce((sum, order) => sum + order.rate * order.quantity, 0);

  const totComp = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + (order.completionAmount || 0), 0);

  const countPending = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const countCompleted = orders.filter(
    (order) => order.status === "completed"
  ).length;

  // Form states
  const [newOrder, setNewOrder] = useState({
    name: "",
    rate: "",
    quantity: "",
  });

  const [proceedData, setProceedData] = useState({
    quantity: "",
    rate: "",
    receiver: "",
    pay: "",
    amount: "",
  });
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const proceedModalRef = useRef(null);
  const modalInstanceRef = useRef(null);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Init modal
  useEffect(() => {
    if (proceedModalRef.current && !modalInstanceRef.current) {
      modalInstanceRef.current = new Modal(proceedModalRef.current, {
        backdrop: "static",
        keyboard: true,
      });
    }
  }, []);

  // Load Orders
  const loadOrders = async () => {
    try {
      const data = await window.api.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    }
  };

  // Create order form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Proceed form change
  const handleProceedChange = (e) => {
    const { name, value } = e.target;
    setProceedData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "pay") {
        console.log("Pay field changed:", value); // 🔍 Debug here
      }
      if (name === "quantity" || name === "rate") {
        const qty = Number(next.quantity) || 0;
        const rate = Number(next.rate) || 0;
        next.amount = qty * rate;
      }

      return next;
    });
  };

  // Add Order
  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.name || !newOrder.rate || !newOrder.quantity) {
      alert("Please fill in all fields");
      return;
    }

    const orderToSend = {
      name: String(newOrder.name).trim(),
      rate: Number(newOrder.rate),
      quantity: Number(newOrder.quantity),
      status: "pending",
      total: Number(newOrder.rate) * Number(newOrder.quantity),
    };

    try {
      await window.api.addOrder(orderToSend);
      await loadOrders();
      setNewOrder({ name: "", rate: 0, quantity: 0 });
    } catch (err) {
      console.error("Error adding order:", err);
    }
  };

  // Proceed / Complete
  const handleProceedClick = (id) => {
    setSelectedOrderId(id);
    setProceedData({
      quantity: "",
      rate: "",
      pay: "",
      receiver: "",
      amount: "",
    });

    modalInstanceRef.current?.show();
  };

  const handleProceedSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    try {
      console.log("ProceedData at submit:", proceedData);

      await window.api.completeOrder({
        id: selectedOrderId,
        quantity: Number(proceedData.quantity),
        rate: Number(proceedData.rate),
        receiver: String(proceedData.receiver).trim(),
        pay: proceedData.pay,
      });
      await loadOrders();
    } catch (err) {
      console.error("Error completing order:", err);
    } finally {
      modalInstanceRef.current?.hide();
    }
  };

  // Delete
  const handleDeleteOrder = async (id) => {
    if (!id) return;
    try {
      await window.api.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  // Cancel
  const handleCancel = async (id) => {
    if (!id) return;

    try {
      await window.api.updateOrder(id, { status: "cancelled" });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: "cancelled" } : o))
      );
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  return (
    <div className="main-content bg-light pt-4 pe-4">
      {/* Create Order */}
      <CreateOrderForm
        newOrder={newOrder}
        handleChange={handleChange}
        handleAddOrder={handleAddOrder}
      />

      {/* Totals */}
      <OrdersSummary
        totPending={totPending}
        totComp={totComp}
        countPending={countPending}
        countCompleted={countCompleted}
      />

      {/* Orders */}
      <OrderList
        orders={orders}
        onDelete={handleDeleteOrder}
        onCancel={handleCancel}
        onProceed={handleProceedClick}
      />

      {/* Proceed Modal */}
      <ProceedModal
        proceedModalRef={proceedModalRef}
        modalInstanceRef={modalInstanceRef}
        proceedData={proceedData}
        handleProceedChange={handleProceedChange}
        handleProceedSubmit={handleProceedSubmit}
      />
    </div>
  );
};

export default Orders;
