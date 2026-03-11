import { Redis } from '@upstash/redis';

// Initialize Redis client using Upstash env variables
const redis = Redis.fromEnv();

// ExchangeRate-API URL (we will use the free tier which doesn't require a key for basic pairs, or we can use a hardcoded fallback if API fails)
const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

// Constants
const CACHE_KEY = 'exchange_rates_v1';
const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

export type ExchangeRates = {
    base_code: string;
    rates: Record<string, number>;
    last_updated: number;
};

// Default fallback rates in case everything fails (based on approximate recent values)
const FALLBACK_RATES: ExchangeRates = {
    base_code: 'USD',
    rates: {
        USD: 1,
        BRL: 5.50,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 150.0,
        CAD: 1.35,
        AUD: 1.52
    },
    last_updated: Date.now()
};

/**
 * Fetches current exchange rates, utilizing Redis cache to prevent rate-limiting.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
    try {
        // 1. Try to get from Redis cache
        const cachedStr = await redis.get<string>(CACHE_KEY);
        if (cachedStr) {
            try {
                // Upstash redis.get might return already parsed JSON or string
                const cachedRates = typeof cachedStr === 'string' ? JSON.parse(cachedStr) : cachedStr;
                return cachedRates as ExchangeRates;
            } catch (e) {
                console.error('Failed to parse cached rates', e);
            }
        }

        // 2. Fetch fresh from API
        const response = await fetch(EXCHANGE_API_URL, {
            next: { revalidate: CACHE_TTL } // Next.js fetch cache as secondary layer
        });

        if (!response.ok) {
            throw new Error(`Exchange API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error(`Exchange API returned failure: ${data['error-type']}`);
        }

        const ratesToCache: ExchangeRates = {
            base_code: data.base_code,
            rates: data.rates,
            last_updated: Date.now()
        };

        // 3. Save to Redis
        await redis.set(CACHE_KEY, JSON.stringify(ratesToCache), { ex: CACHE_TTL });

        return ratesToCache;

    } catch (error) {
        console.error('Failed to fetch exchange rates, using fallback:', error);
        return FALLBACK_RATES;
    }
}

/**
 * Converts an amount from one currency to another using the latest exchange rates.
 */
export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return amount;
    if (amount === 0) return 0;

    const data = await getExchangeRates();
    const rates = data.rates;

    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) {
        console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}. Returning original amount.`);
        return amount; // Fallback to original if rate not found to avoid breaking UI
    }

    // Convert to base (USD), then to target
    const amountInUSD = amount / fromRate;
    const finalAmount = amountInUSD * toRate;

    return finalAmount;
}

/**
 * Common supported currencies for the UI
 */
export const SUPPORTED_CURRENCIES = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$' },
];

/**
 * Formats a numeric value as a currency string using the specified currency code.
 */
export function formatCurrency(amount: number, currencyCode: string = 'BRL'): string {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currencyInfo?.symbol || 'R$';

    // We use pt-BR locale by default for formatting numbers to stay consistent with the UI
    const formattedNumber = amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${symbol} ${formattedNumber}`;
}
