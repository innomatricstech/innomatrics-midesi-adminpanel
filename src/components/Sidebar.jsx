import React, { useState, useEffect } from "react";
import "../styles/sidebar.css";
import { Offcanvas } from "bootstrap";

const Sidebar = ({ activeItem, onSelect }) => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth >= 992 && collapsed) setCollapsed(false);
      else if (window.innerWidth < 992 && !collapsed) setCollapsed(true);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [collapsed]);

  const navGroups = [
    {
      title: "MAIN MENU",
      items: [
        { name: "Dashboard", icon: "⌂" },
        { name: "Products", icon: "📦" },
        { name: "Orders", icon: "📋" },
        { name: "Category", icon: "🏷️" },
        { name: "Brands", icon: "💎" },
        { name: "Banners", icon: "🖼️" },
        { name: "Youtube Videos", icon: "⏯️" },
        { name: "Stock Notifier", icon: "📈" }, // ✅ Added here
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "Wallet", icon: "💳" },
        { name: "Referral", icon: "🤝" },
        { name: "Recharge Request", icon: "💸" },
        { name: "Recharge Provider", icon: "📶" },
        { name: "Recharge Plan", icon: "📱" },
        { name: "Partner Management", icon: "🧑‍💼" },
        { name: "Customer Details", icon: "👤" },
      ],
    },
  ];

  const renderNav = (isMobileView) => (
    <nav className="flex-grow-1 pt-3">
      {navGroups.map((group) => (
        <div key={group.title} className="mb-4">
          {!(collapsed && !isMobileView) && (
            <p className="text-uppercase text-muted small fw-bold mb-2 ps-3">
              {group.title}
            </p>
          )}
          <ul className="nav nav-pills flex-column mb-3">
            {group.items.map((item) => (
              <li className="nav-item" key={item.name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(item.name);
                  }}
                  className={`nav-link ${
                    activeItem === item.name
                      ? "active"
                      : "text-dark hover-bg-light"
                  } p-2 mb-1 mx-2 d-flex align-items-center`}
                  {...(isMobileView && { "data-bs-dismiss": "offcanvas" })}
                >
                  <span
                    className="me-2 fs-6 sidebar-icon"
                    style={{
                      transition: "transform 0.2s ease-out",
                      display: "inline-block",
                    }}
                  >
                    {item.icon}
                  </span>
                  {!(collapsed && !isMobileView) && item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Offcanvas Sidebar */}
      <div
        className="offcanvas offcanvas-start d-lg-none"
        tabIndex="-1"
        id="mobileSidebarOffcanvas"
      >
        <div className="offcanvas-header border-bottom">
          <div className="d-flex align-items-center">
            <span className="fs-4 fw-bolder text-primary me-1">Mi</span>
            <span className="fs-4 fw-bolder text-dark">Desi</span>
          </div>
          <button
            type="button"
            className="btn-close text-reset"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body d-flex flex-column p-0">
          {renderNav(true)}
          <div className="mt-auto pt-3 text-center">© 2025 MiDesi</div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`sidebar-container d-none d-lg-flex flex-column ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <div className="d-flex justify-content-between align-items-center p-3 mb-3">
          <div className="d-flex align-items-center">
            <span className="fs-4 fw-bolder text-primary me-1">Mi</span>
            {!collapsed && <span className="fs-4 fw-bolder text-dark">Desi</span>}
          </div>
        </div>

        {renderNav(false)}

        {!collapsed && <div className="mt-auto pt-3 text-center">© 2025 MiDesi</div>}
      </div>
    </>
  );
};

export default Sidebar;
