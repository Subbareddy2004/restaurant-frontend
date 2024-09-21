// order-bot/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file

const App = () => {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        {
            text: `👋 *Welcome to the Food Ordering Chatbot!*

🍽 How can I assist you today? You can ask me to order food, browse the menu, or get recommendations. Here are some examples of what you can do:
  
- "Show me the menu"
- "I want to order chicken biryani"
- "What do you recommend for dessert?"

Type your request below, and I'll help you with your order! 😊`,
            sender: 'bot',
            name: 'OrderBot'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [menu, setMenu] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [order, setOrder] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchMenu = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/menu`);
            setMenu(response.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;
        
        const userMessage = { text: message, sender: 'user', name: 'You' };
        setChat(prevChat => [...prevChat, userMessage]);
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/api/chat`, { prompt: message });
            const botMessage = { text: response.data.response, sender: 'bot', name: 'OrderBot' };
            setChat(prevChat => [...prevChat, botMessage]);

            await getRecommendedMenu(message);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { text: 'Sorry, there was an error processing your request.', sender: 'bot', name: 'OrderBot' };
            setChat(prevChat => [...prevChat, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const getRecommendedMenu = async (prompt) => {
        try {
            const response = await axios.post(`${API_URL}/api/menu/recommend`, { prompt });
            setFilteredMenu(response.data);
        } catch (error) {
            console.error('Error getting recommended menu:', error);
        }
    };

    const addToOrder = (item) => {
        setOrder(prevOrder => [...prevOrder, item]);
        setTotalPrice(prevTotal => prevTotal + parseFloat(item.price));
    };

    const confirmOrder = () => {
        setShowConfirmation(true);
    };

    const finalizeOrder = () => {
        const orderSummary = order.map(item => item.name).join(', ');
        const confirmationMessage = `Your order of ${orderSummary} has been confirmed! Total: ₹${totalPrice.toFixed(2)}. It will arrive in approximately 30 minutes.`;
        setChat(prevChat => [...prevChat, { text: confirmationMessage, sender: 'bot' }]);
        setOrder([]);
        setTotalPrice(0);
        setShowConfirmation(false);
    };

    return (
        <div className="app-container">
            <div className="menu-container">
                <h2>Recommended Menu</h2>
                {filteredMenu.map((item) => (
                    <div key={item.id} className="menu-item">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>Category: {item.category}</p>
                        <p>Price: ₹{parseFloat(item.price).toFixed(2)}</p>
                        <button onClick={() => addToOrder(item)}>Add to Order</button>
                    </div>
                ))}
            </div>
            <div className="chat-container">
                <h1>Food Ordering Chatbot</h1>
                <div className="chat-messages">
                    {chat.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}-message`}>
                            <strong>{msg.name}: </strong>
                            <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br>') }} />
                        </div>
                    ))}
                    {loading && <div className="loading">Loading...</div>}
                </div>
                <div className="chat-input">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                    />
                    <button onClick={handleSend}>Send</button>
                </div>
            </div>
            <div className="order-container">
                <h2>Your Order</h2>
                {order.map((item, index) => (
                    <div key={index} className="order-item">
                        <span>{item.name}</span>
                        <span>₹{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                ))}
                <div className="total-price">Total: ₹{totalPrice.toFixed(2)}</div>
                {order.length > 0 && (
                    <button onClick={confirmOrder}>Confirm Order</button>
                )}
            </div>
            {showConfirmation && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirm Your Order</h2>
                        <div className="order-summary">
                            {order.map((item, index) => (
                                <div key={index} className="order-item-confirm">
                                    <span>{item.name}</span>
                                    <span>₹{parseFloat(item.price).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="order-total">
                                <span>Total:</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={finalizeOrder}>Confirm Order</button>
                            <button className="cancel-button" onClick={() => setShowConfirmation(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;