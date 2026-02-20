import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import './index.css'

// Test without Layout to see if Layout is the problem
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <div style={{ background: '#1A1B1E', minHeight: '100vh', color: 'white', padding: '20px' }}>
                <h1>APP WITHOUT LAYOUT</h1>
                <App />
            </div>
        </BrowserRouter>
    </React.StrictMode>,
)
