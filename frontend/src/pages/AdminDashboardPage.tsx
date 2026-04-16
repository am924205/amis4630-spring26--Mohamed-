import React from "react";
import { Link } from "react-router-dom";

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Admin Dashboard</h1>
      <div className="admin-grid">
        <Link to="/admin/products" className="admin-tile">
          <h2>Manage Products</h2>
          <p>Create, edit, or remove products.</p>
        </Link>
        <Link to="/admin/orders" className="admin-tile">
          <h2>Manage Orders</h2>
          <p>View orders and update their status.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
