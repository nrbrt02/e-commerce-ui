import axios from 'axios';

// Exchange rate API endpoint (you'll need to replace with your preferred provider)
const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/RWF';

// Cache for exchange rates
let exchangeRateCache: {
  rates: { [key: string]: number } | null;
  timestamp: number;
} = {
  rates: null,
  timestamp: 0,
};

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 3600000;

export const convertCurrency = async (
  amount: number,
  fromCurrency: string = 'RWF',
  toCurrency: string = 'USD'
): Promise<number> => {
  try {
    // Check if we have a valid cached rate
    const now = Date.now();
    if (
      exchangeRateCache.rates &&
      now - exchangeRateCache.timestamp < CACHE_DURATION
    ) {
      const rate = exchangeRateCache.rates[toCurrency];
      if (rate) {
        return amount * rate;
      }
    }

    // Fetch fresh exchange rates
    const response = await axios.get(EXCHANGE_RATE_API);
    const rates = response.data.rates;

    // Update cache
    exchangeRateCache = {
      rates,
      timestamp: now,
    };

    // Convert amount
    const rate = rates[toCurrency];
    if (!rate) {
      throw new Error(`Exchange rate not available for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

export const formatCurrency = (
  amount: number,
  currency: string = 'RWF',
  locale: string = 'en-RW'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to get PayPal amount in USD
export const getPayPalAmount = async (rwfAmount: number): Promise<{
  amount: number;
  formattedAmount: string;
}> => {
  const usdAmount = await convertCurrency(rwfAmount, 'RWF', 'USD');
  return {
    amount: usdAmount,
    formattedAmount: formatCurrency(usdAmount, 'USD'),
  };
}; 