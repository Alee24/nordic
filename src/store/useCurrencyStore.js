import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const KES_TO_USD_RATE = 1 / 130; // Approximation: 1 USD = 130 KES

const useCurrencyStore = create(
    persist(
        (set, get) => ({
            currency: 'KES',
            setCurrency: (currency) => set({ currency }),
            toggleCurrency: () => set((state) => ({ currency: state.currency === 'KES' ? 'USD' : 'KES' })),
            formatPrice: (priceKES) => {
                if (priceKES === null || priceKES === undefined || isNaN(Number(priceKES)) || Number(priceKES) <= 0) {
                    return 'Coming Soon';
                }
                const price = Number(priceKES);
                const { currency } = get();
                if (currency === 'USD') {
                    const priceUSD = Math.round(price * KES_TO_USD_RATE);
                    return `USD ${priceUSD.toLocaleString()}`;
                }
                return `KES ${price.toLocaleString()}`;
            }
        }),
        {
            name: 'norden-currency',
        }
    )
);

export default useCurrencyStore;
