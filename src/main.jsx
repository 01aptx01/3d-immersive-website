import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './worlds/keyboard/App.jsx';
import './worlds/keyboard/styles.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

