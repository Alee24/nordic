import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Minimal working app
const WorkingApp = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#0ea5e9',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            zIndex: 9999
        }}>
            <h1 style={{ fontSize: '64px', margin: 0 }}>✅ REACT IS ALIVE</h1>
            <p style={{ fontSize: '24px', marginTop: '20px' }}>The app is successfully mounting!</p>
            <p style={{ fontSize: '18px', marginTop: '10px', opacity: 0.8 }}>Now we'll restore the full app...</p>
        </div>
    );
};

console.log('🚀 main-working.jsx loading...');
const container = document.getElementById('root');
if (container) {
    console.log('✅ Root element found');
    const root = createRoot(container);
    root.render(<WorkingApp />);
    console.log('✅ React app rendered');
} else {
    console.error('❌ ROOT ELEMENT NOT FOUND!');
}
