/**
 * Navbar Component - DevDiscuss Navigation
 * 
 * FEATURES:
 * - Sticky positioning (always visible)
 * - Glassmorphism effect (modern frosted glass)
 * - User avatar with dropdown menu
 * - Mobile responsive with hamburger menu
 * - Smooth animations on all interactions
 * 
 * INTERVIEW TALKING POINTS:
 * - Uses useState for local UI state (dropdown, mobile menu)
 * - Uses useRef + useEffect for "click outside to close" pattern
 * - Conditional rendering based on auth state
 * - Accessible keyboard navigation
 */

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
  // ==========================================
  // HOOKS & STATE
  // ==========================================
  
  // Auth context - provides user data and logout function
  const { user, logout } = useAuth();
  
  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation(); // Used to highlight active nav item
  
  // Local UI state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Ref for dropdown - used for "click outside" detection
  // WHY: We need to close dropdown when user clicks elsewhere
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // CLICK OUTSIDE HANDLER
  // ==========================================
  /**
   * WHY THIS PATTERN?
   * - Users expect dropdowns to close when clicking outside
   * - This is a common pattern in production apps
   * - Uses event listener on document
   * 
   * INTERVIEW TIP: This demonstrates useEffect cleanup
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click was outside the dropdown
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Add listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup: Remove listener when component unmounts
    // WHY: Prevents memory leaks and duplicate listeners
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty deps = run once on mount

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  
  /**
   * Handle logout - clears auth state and redirects
   */
  const handleLogout = () => {
    logout();                          // Clear auth context + localStorage
    setIsDropdownOpen(false);          // Close dropdown
    navigate("/login");                // Redirect to login page
  };

  /**
   * Get user initials for avatar
   * WHY: Generates initials from name (e.g., "John Doe" → "JD")
   * Falls back to "?" if no name available
   */
  const getUserInitials = (): string => {
    if (!user?.name) return "?";
    
    return user.name
      .split(" ")                      // Split by spaces
      .map((word) => word[0])          // Get first letter of each word
      .join("")                        // Join them together
      .toUpperCase()                   // Uppercase
      .slice(0, 2);                    // Max 2 characters
  };

  /**
   * Check if a nav link is currently active
   * WHY: Highlights the current page in navigation
   */
  const isActiveLink = (path: string): boolean => {
    return location.pathname === path;
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  
  /**
   * Logo component (reused in mobile & desktop)
   */
  const Logo = () => (
    <Link 
      to={user ? "/posts" : "/login"}
      className="flex items-center gap-2 group"
    >
      {/* Logo icon - code brackets */}
      <div className="
        w-10 h-10 rounded-xl
        bg-gradient-to-br from-blue-500 to-purple-600
        flex items-center justify-center
        shadow-lg
        group-hover:shadow-glow-blue
        transition-all duration-250
        group-hover:scale-105
      ">
        <span className="text-white font-bold text-lg">&lt;/&gt;</span>
      </div>
      
      {/* Brand name with gradient text */}
      <span className="
        text-xl font-bold
        text-gradient
        hidden sm:block
      ">
        DevDiscuss
      </span>
    </Link>
  );

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <nav className="
      sticky top-0 z-50
      bg-white/80 backdrop-blur-md
      border-b border-gray-200/50
      shadow-soft
    ">
      {/* 
        Container with max-width for large screens
        WHY: Prevents navbar from stretching too wide on large monitors
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ==========================================
              LEFT SIDE: Logo
              ========================================== */}
          <Logo />

          {/* ==========================================
              RIGHT SIDE: Navigation Items
              ========================================== */}
          <div className="flex items-center gap-4">
            {user ? (
              /* ========== AUTHENTICATED USER VIEW ========== */
              <>
                {/* Create Post Button - Desktop only */}
                <Link
                  to="/create-post"
                  className="
                    hidden sm:flex items-center gap-2
                    btn-primary
                  "
                >
                  {/* Plus icon */}
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4v16m8-8H4" 
                    />
                  </svg>
                  <span>Ask Question</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown Trigger - Avatar Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="
                      flex items-center gap-2
                      p-1.5 rounded-full
                      hover:bg-gray-100
                      transition-colors duration-200
                      focus-visible:ring-2 focus-visible:ring-blue-500
                    "
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                  >
                    {/* Avatar with initials */}
                    <div className="
                      w-9 h-9 rounded-full
                      bg-gradient-to-br from-blue-500 to-purple-600
                      flex items-center justify-center
                      text-white text-sm font-semibold
                      shadow-md
                    ">
                      {getUserInitials()}
                    </div>
                    
                    {/* Chevron icon - rotates when open */}
                    <svg
                      className={`
                        w-4 h-4 text-gray-500
                        transition-transform duration-200
                        ${isDropdownOpen ? "rotate-180" : ""}
                      `}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="
                      absolute right-0 mt-2 w-56
                      bg-white rounded-xl
                      shadow-elevated
                      border border-gray-100
                      py-2
                      animate-slide-down
                      z-50
                    ">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        {/* Posts Link */}
                        <Link
                          to="/posts"
                          onClick={() => setIsDropdownOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-2
                            text-sm text-gray-700
                            hover:bg-gray-50
                            transition-colors
                            ${isActiveLink("/posts") ? "bg-blue-50 text-blue-700" : ""}
                          `}
                        >
                          {/* Home icon */}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>All Posts</span>
                        </Link>

                        {/* Create Post Link - Mobile visible */}
                        <Link
                          to="/create-post"
                          onClick={() => setIsDropdownOpen(false)}
                          className="
                            flex items-center gap-3 px-4 py-2
                            text-sm text-gray-700
                            hover:bg-gray-50
                            transition-colors
                            sm:hidden
                          "
                        >
                          {/* Plus icon */}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Ask Question</span>
                        </Link>
                      </div>

                      {/* Logout Section */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="
                            flex items-center gap-3 px-4 py-2 w-full
                            text-sm text-red-600
                            hover:bg-red-50
                            transition-colors
                          "
                        >
                          {/* Logout icon */}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ========== GUEST/UNAUTHENTICATED VIEW ========== */
              <div className="flex items-center gap-3">
                {/* Login Link */}
                <Link
                  to="/login"
                  className={`
                    px-4 py-2 rounded-lg
                    text-sm font-medium
                    transition-all duration-200
                    ${isActiveLink("/login") 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  Log in
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
