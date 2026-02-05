import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, LayoutDashboard, Tag, Mail } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Bảng Điều Khiển", icon: LayoutDashboard },
    { path: "/categories", label: "Danh Mục", icon: Tag },
    {
      path: "/bank-email-configs",
      label: "Cấu hình Email",
      icon: Mail,
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-red-600 to-orange-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3 sm:space-x-8">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 text-lg sm:text-2xl font-bold text-white hover:text-red-100 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-red-600 font-extrabold text-lg sm:text-xl">
                  S
                </span>
              </div>
              <span className="hidden sm:inline">SpendWise</span>
              <span className="sm:hidden">SW</span>
            </Link>

            <div className="flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white bg-opacity-20 text-white shadow-lg"
                        : "text-red-100 hover:bg-white hover:bg-opacity-10"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden md:inline text-sm">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline text-sm text-red-100">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 shadow-md"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
