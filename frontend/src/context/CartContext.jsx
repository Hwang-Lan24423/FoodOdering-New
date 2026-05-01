import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const localData = localStorage.getItem('cart');
            const parsed = localData ? JSON.parse(localData) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            const maxQty = product.quantity || 999;

            if (existingItem) {
                if (existingItem.cartQuantity + 1 > maxQty) {
                    alert(`Rất tiếc, sản phẩm này hiện chỉ còn ${maxQty} phần trong kho.`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.id === product.id 
                        ? { ...item, cartQuantity: item.cartQuantity + 1 } 
                        : item
                );
            }
            
            if (1 > maxQty) {
                alert('Sản phẩm này đã hết hàng.');
                return prevCart;
            }
            return [...prevCart, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, amount) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === productId) {
                const maxQty = item.quantity || 999;
                if (item.cartQuantity + amount > maxQty) {
                    alert(`Rất tiếc, sản phẩm này hiện chỉ còn ${maxQty} phần trong kho.`);
                    return item; // Giữ nguyên số lượng hiện tại
                }
                const newQty = Math.max(1, item.cartQuantity + amount);
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const setExactQuantity = (productId, qty) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === productId) {
                const maxQty = item.quantity || 999;
                let newQty = Math.max(1, parseInt(qty) || 1);
                
                if (newQty > maxQty) {
                    alert(`Rất tiếc, bạn không thể nhập quá số lượng ${maxQty} đang có.`);
                    newQty = maxQty; // Tự động giảm xuống mức tối đa có thể mua
                }
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
    const cartCount = cart.reduce((total, item) => total + item.cartQuantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            setExactQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
