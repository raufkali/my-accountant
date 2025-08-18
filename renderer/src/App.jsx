import React from "react";
import SidePanel from "./components/SidePanel.jsx";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx";
import Transactions from "./components/Transactions.jsx";
import Accounts from "./components/Accounts.jsx";
import Orders from "./components/Orders.jsx";
const App = () => {
  return (
    <>
      <SidePanel />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/accounts" element={<Accounts />} />
      </Routes>
    </>
  );
};

export default App;
