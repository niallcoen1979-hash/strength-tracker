import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthCallback from './AuthCallback';

const root = ReactDOM.createRoot(document.getElementById('root'));

const params = new URLSearchParams(window.location.search);
const hasCode = params.has('code');
const hasAccessToken = window.location.hash.includes('access_token');

root.render(hasCode || hasAccessToken ? <AuthCallback /> : <App />);