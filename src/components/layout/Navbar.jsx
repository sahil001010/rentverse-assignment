import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { FaWallet } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isConnected, isLoggedIn, account, openWalletModal } = useWallet();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
  ];

  const truncatedAccount = account
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : '';

  return (
    <nav className="bg-white dark:bg-secondary-900 border-b border-secondary-100 dark:border-secondary-800 shadow-sm transition-colors duration-200 sticky top-0 z-40">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center space-x-2">
              <svg width="30" height="35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="20" r="10" stroke="#0682ff" />
                <circle cx="15" cy="20" r="6" stroke="#0682ff" strokeWidth="3" />
              </svg>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-0.5">RentVerse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors focus:outline-none"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? (
                <FiSun className="w-5 h-5 text-amber-400" />
              ) : (
                <FiMoon className="w-5 h-5 text-secondary-600" />
              )}
            </button>

            {/* Wallet Connect Button */}
            <button
              onClick={openWalletModal}
              className={`btn flex items-center space-x-2 font-medium transition-all ${
                isLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              <FaWallet className="w-4 h-4" />
              <span>{isLoggedIn ? truncatedAccount : isConnected ? 'Sign in' : 'Connect'}</span>
              {isLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse ml-1"></span>
              )}
            </button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Mobile Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              {isDarkMode ? (
                <FiSun className="w-5 h-5 text-amber-400" />
              ) : (
                <FiMoon className="w-5 h-5 text-secondary-600" />
              )}
            </button>

            <button
              type="button"
              className="text-secondary-600 dark:text-secondary-300 hover:text-primary-600 p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-secondary-100 dark:border-secondary-800 py-3 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-3 py-2 text-base font-medium text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              className={`w-full text-left px-4 py-2.5 text-base font-medium text-white rounded-md flex items-center justify-between ${
                isLoggedIn ? 'bg-emerald-600' : 'bg-primary-600'
              }`}
              onClick={() => {
                setIsOpen(false);
                openWalletModal();
              }}
            >
              <div className="flex items-center space-x-2">
                <FaWallet />
                <span>{isLoggedIn ? truncatedAccount : isConnected ? 'Sign in' : 'Connect'}</span>
              </div>
              {isLoggedIn && <span className="w-2 h-2 rounded-full bg-white"></span>}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;