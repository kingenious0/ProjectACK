import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { pingAppwrite } from './lib/appwrite';

// Verify connection with Appwrite Console
pingAppwrite();

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Root element #root not found in document.');
}
