import React from 'react';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { DatesProvider } from '@mantine/dates';
import { nordenTheme } from '../../theme';
import Navigation from '../ui/Navigation';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/carousel/styles.css';

import ScrollToTop from '../../utils/ScrollToTop';
import Footer from './Footer';
import useManagementStore from '../../store/useManagementStore';
import 'dayjs/locale/en';

const colorSchemeManager = localStorageColorSchemeManager({ key: 'norden-color-scheme' });

const Layout = ({ children }) => {
    const { currentView } = useManagementStore();
    const isStaff = currentView === 'staff';

    return (
        <MantineProvider theme={nordenTheme} defaultColorScheme="light" colorSchemeManager={colorSchemeManager}>
            <DatesProvider settings={{ locale: 'en', firstDayOfWeek: 0, weekendDays: [0, 6] }}>
                <Notifications position="top-right" zIndex={2000} />
                <ScrollToTop />
                <div className={`min-h-screen bg-theme-bg text-theme-text font-sans selection:bg-norden-gold-500 selection:text-norden-dark-900 flex flex-col transition-colors duration-300`}>
                    {!isStaff && <Navigation />}
                    <main className={`flex-1 relative z-0 ${!isStaff ? 'pt-0' : ''}`}>
                        {children}
                    </main>
                    {!isStaff && <Footer />}
                </div>
            </DatesProvider>
        </MantineProvider>
    );
};

export default Layout;
