import { createTheme } from '@mantine/core';

export const nordicTheme = createTheme({
    primaryColor: 'gold',
    colors: {
        // Custom colors matching the palette
        midnight: [
            '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', '#373A40',
            '#2C2E33', '#25262B', '#1A1B1E', '#141517', '#101113',
        ],
        frost: [
            '#FFFFFF', '#F8FAFB', '#F1F5F7', '#E1E8ED', '#D1DAE1',
            '#B1C1CE', '#91A8BB', '#718FA8', '#517695', '#315D82',
        ],
        gold: [
            '#FFF9E6', '#FFECB3', '#FFDF80', '#FFD24D', '#FFC51A',
            '#E6AF17', '#D4AF37', '#B3942F', '#927926', '#715E1D',
        ],
    },
    fontFamily: 'Inter, sans-serif',
    headings: {
        fontFamily: 'Playfair Display, serif',
        fontWeight: '700',
    },
    defaultRadius: 'md',
    components: {
        Button: {
            defaultProps: {
                variant: 'filled',
                color: 'gold',
            },
            styles: (theme) => ({
                root: {
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                    },
                },
            }),
        },
        Card: {
            styles: (theme) => ({
                root: {
                    backgroundColor: 'var(--color-theme-surface)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid var(--color-theme-border)',
                    color: 'var(--color-theme-text)',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 'var(--mantine-shadow-lg)',
                    },
                },
            }),
        },
    },
});
