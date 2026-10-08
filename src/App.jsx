import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Property3D from './pages/Property3D';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider, useWallet } from './context/WalletContext';
import WalletModal from './components/common/WalletModal';

function ToastNotification() {
  const { toastMessage } = useWallet();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-secondary-900 text-white dark:bg-white dark:text-secondary-900 text-sm font-semibold rounded-xl shadow-2xl transition-all animate-bounce flex items-center space-x-2">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <span>{toastMessage}</span>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-secondary-50 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-100 transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/property-3d" element={<Property3D />} />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WalletModal />
            <ToastNotification />
          </div>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;