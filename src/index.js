import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Убедитесь, что путь правильный
import reportWebVitals from './reportWebVitals'; // Убедитесь, что путь правильный

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();