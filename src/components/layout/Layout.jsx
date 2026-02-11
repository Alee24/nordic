import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { nordicTheme } from '../../theme';
import Navigation from '../ui/Navigation';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/carousel/styles.css';

import ScrollToTop from '../../utils/ScrollToTop';
import Footer from './Footer';
import useManagementStore from '../../store/useManagementStore';

const Layout = ({ children }) => {
    const { currentView } = useManagementStore();
    const isStaff = currentView === 'staff';

    return (
        <MantineProvider theme={nordicTheme} defaultColorScheme="dark">
            <Notifications position="top-right" zIndex={2000} />
            <ScrollToTop />
            <div className={`min-h-screen bg-theme-bg text-theme-text font-sans selection:bg-nordic-gold-500 selection:text-nordic-dark-900 flex flex-col transition-colors duration-300`}>
                {!isStaff && <Navigation />}
                <main className={`flex-1 relative z-0 ${!isStaff ? 'pt-0' : ''}`}>
                    {children}
                </main>
                {!isStaff && <Footer />}
            </div>
        </MantineProvider>
    );
};

export default Layout;
