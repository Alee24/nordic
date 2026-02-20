import React from 'react'
import { createRoot } from 'react-dom/client'

// Ultra-minimal test
const TestApp = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'red',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            zIndex: 999999
        }}>
            REACT IS WORKING
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<TestApp />);
} else {
    console.error('ROOT ELEMENT NOT FOUND!');
}
