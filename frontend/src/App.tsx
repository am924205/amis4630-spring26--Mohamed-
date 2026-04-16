import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Header />
            <Notification />
            <Routes>
              <Route path="/" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/cart"
                element={<ProtectedRoute><CartPage /></ProtectedRoute>}
              />
              <Route
                path="/checkout"
                element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
              />
              <Route
                path="/orders"
                element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>}
              />
              <Route
                path="/orders/confirmation/:id"
                element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute requireAdmin><AdminDashboardPage /></ProtectedRoute>}
              />
              <Route
                path="/admin/products"
                element={<ProtectedRoute requireAdmin><AdminProductsPage /></ProtectedRoute>}
              />
              <Route
                path="/admin/orders"
                element={<ProtectedRoute requireAdmin><AdminOrdersPage /></ProtectedRoute>}
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
