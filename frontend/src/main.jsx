import { createRoot } from 'react-dom/client';
import './app.css';
import App from './components/App';
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')).render(
  <CartProvider>
    <App />
  </CartProvider>
);

