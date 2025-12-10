import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  
  
  const getActiveTab = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/transactions')) return 'transactions';
    if (path.includes('/portfolio')) return 'portfolio';
    if (path.includes('/wallet')) return 'wallet';
    if (path.includes('/trading')) return 'trading';
    if (path.includes('/marketplace')) return 'marketplace';
    if (path.includes('/market-data')) return 'market-data';
    if (path.includes('/apply-tokenize')) return 'apply-tokenize';
    if (path.includes('/ai-insights')) return 'ai-insights';
    if (path.includes('/overview')) return 'overview';
    if (path === '/dashboard' || path === '/dashboard/') return 'overview';
    return 'overview';
  }, [location.pathname]);
  
  const active = getActiveTab();

  function NavItem({ label, svg, id, to, tooltip }) {
    const isActive = active === id;
    const isHovered = hoveredItem === id;
    const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0 });
    const navItemRef = React.useRef(null);
    
    React.useEffect(() => {
      if (isHovered && navItemRef.current && isCollapsed) {
        const rect = navItemRef.current.getBoundingClientRect();
        setTooltipPosition({ top: rect.top + rect.height / 2 });
      }
    }, [isHovered, isCollapsed]);
    
    return (
      <div className="nav-item-wrapper" ref={navItemRef}>
        <Link
          to={to}
          className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
          onMouseEnter={() => setHoveredItem(id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="nav-item-icon">
            {svg}
          </div>
          {!isCollapsed && <span className="nav-item-label">{label}</span>}
        </Link>
        
        {}
        {isCollapsed && isHovered && (
          <div className="nav-tooltip" style={{ top: `${tooltipPosition.top}px` }}>
            <span>{label}</span>
            <div className="nav-tooltip-arrow"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img src="/domufilogoofficial.png" alt="Domufi" style={{ width: 36, height: 36, borderRadius: 8 }} />
          {!isCollapsed && <span style={{ marginLeft: 6 }}>Domufi</span>}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <nav className="nav">
        <div className="nav-section">
          {!isCollapsed && <div className="nav-label">Dashboard</div>}
          <div className="nav-items">
            <NavItem id="overview" label={"Overview"} to="/dashboard/overview" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3H6.2C5.0799 3 4.51984 3 4.09202 3.21799C3.71569 3.40973 3.40973 3.71569 3.21799 4.09202C3 4.51984 3 5.0799 3 6.2V8M8 21H6.2C5.0799 21 4.51984 21 4.09202 20.782C3.71569 20.5903 3.40973 20.2843 3.21799 19.908C3 19.4802 3 18.9201 3 17.8V16M21 8V6.2C21 5.0799 21 4.51984 20.782 4.09202C20.5903 3.71569 20.2843 3.40973 19.908 3.21799C19.4802 3 18.9201 3 17.8 3H16M21 16V17.8C21 18.9201 21 19.4802 20.782 19.908C20.5903 20.2843 20.2843 20.5903 19.908 20.782C19.4802 21 18.9201 21 17.8 21H16M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />

            <NavItem id="portfolio" label={"Portfolio"} to="/dashboard/portfolio" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 7C16 6.07003 16 5.60504 15.8978 5.22354C15.6204 4.18827 14.8117 3.37962 13.7765 3.10222C13.395 3 12.93 3 12 3C11.07 3 10.605 3 10.2235 3.10222C9.18827 3.37962 8.37962 4.18827 8.10222 5.22354C8 5.60504 8 6.07003 8 7M5.2 21H18.8C19.9201 21 20.4802 21 20.908 20.782C21.2843 20.5903 21.5903 20.2843 21.782 19.908C22 19.4802 22 18.9201 22 17.8V10.2C22 9.07989 22 8.51984 21.782 8.09202C21.5903 7.71569 21.2843 7.40973 20.908 7.21799C20.4802 7 19.9201 7 18.8 7H5.2C4.07989 7 3.51984 7 3.09202 7.21799C2.71569 7.40973 2.40973 7.71569 2.21799 8.09202C2 8.51984 2 9.07989 2 10.2V17.8C2 18.9201 2 19.4802 2.21799 19.908C2.40973 20.2843 2.71569 20.5903 3.09202 20.782C3.51984 21 4.0799 21 5.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />

            <NavItem id="transactions" label={"Transactions"} to="/dashboard/transactions" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />

            <NavItem id="wallet" label={"Wallet"} to="/dashboard/wallet" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 8.5H2M2 12.5H5.54668C6.08687 12.5 6.35696 12.5 6.61813 12.5466C6.84995 12.5879 7.0761 12.6563 7.29191 12.7506C7.53504 12.8567 7.75977 13.0065 8.20924 13.3062L8.79076 13.6938C9.24023 13.9935 9.46496 14.1433 9.70809 14.2494C9.9239 14.3437 10.15 14.4121 10.3819 14.4534C10.643 14.5 10.9131 14.5 11.4533 14.5H12.5467C13.0869 14.5 13.357 14.5 13.6181 14.4534C13.85 14.4121 14.0761 14.3437 14.2919 14.2494C14.535 14.1433 14.7598 13.9935 15.2092 13.6938L15.7908 13.3062C16.2402 13.0065 16.465 12.8567 16.7081 12.7506C16.9239 12.6563 17.15 12.5879 17.3819 12.5466C17.643 12.5 17.9131 12.5 18.4533 12.5H22M2 7.2L2 16.8C2 17.9201 2 18.4802 2.21799 18.908C2.40973 19.2843 2.71569 19.5903 3.09202 19.782C3.51984 20 4.07989 20 5.2 20L18.8 20C19.9201 20 20.4802 20 20.908 19.782C21.2843 19.5903 21.5903 19.2843 21.782 18.908C22 18.4802 22 17.9201 22 16.8V7.2C22 6.0799 22 5.51984 21.782 5.09202C21.5903 4.7157 21.2843 4.40974 20.908 4.21799C20.4802 4 19.9201 4 18.8 4L5.2 4C4.0799 4 3.51984 4 3.09202 4.21799C2.7157 4.40973 2.40973 4.71569 2.21799 5.09202C2 5.51984 2 6.07989 2 7.2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />
          </div>
        </div>

        <div className="nav-section">
          {!isCollapsed && <div className="nav-label">Platform</div>}
          <div className="nav-items">
            <NavItem id="marketplace" label={"Marketplace"} to="/dashboard/marketplace" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H21V21H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9H15V15H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />

            <NavItem id="trading" label={"Trading"} to="/dashboard/trading" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />

            <NavItem id="apply-tokenize" label={"Tokenize Property"} to="/dashboard/apply-tokenize" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C16.93 4 17.395 4 17.7765 4.10222C18.8117 4.37962 19.6204 5.18827 19.8978 6.22354C20 6.60504 20 7.07003 20 8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V8C4 7.07003 4 6.60504 4.10222 6.22354C4.37962 5.18827 5.18827 4.37962 6.22354 4.10222C6.60504 4 7.07003 4 8 4M9 15L11 17L15.5 12.5M9.6 6H14.4C14.9601 6 15.2401 6 15.454 5.89101C15.6422 5.79513 15.7951 5.64215 15.891 5.45399C16 5.24008 16 4.96005 16 4.4V3.6C16 3.03995 16 2.75992 15.891 2.54601C15.7951 2.35785 15.6422 2.20487 15.454 2.10899C15.2401 2 14.9601 2 14.4 2H9.6C9.03995 2 8.75992 2 8.54601 2.10899C8.35785 2.20487 8.20487 2.35785 8.10899 2.54601C8 2.75992 8 3.03995 8 3.6V4.4C8 4.96005 8 5.24008 8.10899 5.45399C8.20487 5.64215 8.35785 5.79513 8.54601 5.89101C8.75992 6 9.03995 6 9.6 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />

            <NavItem id="settings" label={"Settings"} to="/dashboard/settings" svg={(
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9889C9.5799 19.7198 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01111 9.77251C4.28021 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.29C19.896 4.47575 20.0435 4.69632 20.1441 4.93912C20.2448 5.18192 20.2966 5.44217 20.2966 5.705C20.2966 5.96783 20.2448 6.22808 20.1441 6.47088C20.0435 6.71368 19.896 6.93425 19.71 7.12L19.65 7.18C19.4195 7.41568 19.2648 7.71502 19.206 8.03941C19.1472 8.36381 19.1869 8.69838 19.32 9H19.41C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )} />
          </div>
        </div>
      </nav>
    </div>
  );
}