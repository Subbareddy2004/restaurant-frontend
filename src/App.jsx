import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { FaPaperPlane, FaUtensils, FaShoppingCart } from 'react-icons/fa';
import './App.css';
import './i18n';

const App = () => {
    const { t, i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('en');

    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        {
            text: t('`👋 Welcome to the Food Ordering Chatbot!'),
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

    const API_URL = 'https://restaurant-backend-liard.vercel.app';

    console.log('API_URL:', API_URL); // Add this line for debugging

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

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setCurrentLanguage(lng);
    };

    return (
        <div className="app-container">
            <div className="language-selector">
                <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)}>
                    <option value="en">{t('languageEnglish')}</option>
                    <option value="te">{t('languageTelugu')}</option>
                    <option value="hi">{t('languageHindi')}</option>
                    <option value="ta">{t('languageTamil')}</option>
                </select>
            </div>
            <div className="chat-container">
                <h1><FaUtensils /> {t('welcome')}</h1>
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
                        placeholder={t('typePlaceholder')}
                    />
                    <button onClick={handleSend}><FaPaperPlane /> {t('send')}</button>
                </div>
            </div>
            <div className="menu-container">
                <h2>{t('recommendedMenu')}</h2>
                {filteredMenu.map((item) => (
                    <div key={item.id} className="menu-item">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <p>{t('category')}: {item.category}</p>
                        <p>{t('price')}: ₹{parseFloat(item.price).toFixed(2)}</p>
                        <button onClick={() => addToOrder(item)}>{t('addToOrder')}</button>
                    </div>
                ))}
            </div>
            <div className="order-container">
                <h2><FaShoppingCart /> {t('yourOrder')}</h2>
                {order.map((item, index) => (
                    <div key={index} className="order-item">
                        <span>{item.name}</span>
                        <span>₹{parseFloat(item.price).toFixed(2)}</span>
                    </div>
                ))}
                <div className="total-price">{t('total')}: ₹{totalPrice.toFixed(2)}</div>
                {order.length > 0 && (
                    <button onClick={confirmOrder}>{t('confirmOrder')}</button>
                )}
            </div>
            {showConfirmation && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{t('confirmYourOrder')}</h2>
                        <div className="order-summary">
                            {order.map((item, index) => (
                                <div key={index} className="order-item-confirm">
                                    <span>{item.name}</span>
                                    <span>₹{parseFloat(item.price).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="order-total">
                                <span>{t('total')}:</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button className="confirm-button" onClick={finalizeOrder}>{t('confirmOrder')}</button>
                            <button className="cancel-button" onClick={() => setShowConfirmation(false)}>{t('cancel')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;