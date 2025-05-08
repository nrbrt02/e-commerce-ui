/**
 * Format a currency value in Rwandan Francs (RWF)
 * @param amount The amount to format
 * @param currencyCode The currency code (default: RWF)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currencyCode = 'RWF'): string => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

  
  /**
   * Format a date string to a human-readable format
   * @param dateString The date string to format
   * @param showTime Whether to include the time in the output
   * @returns Formatted date string
   */
  export const formatDate = (dateString: string, showTime = false): string => {
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    if (showTime) {
      return date.toLocaleString('en-US', {
        ...options,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-US', options);
  };
  
  /**
   * Truncate a string to a specified length and add ellipsis if needed
   * @param str The string to truncate
   * @param length The maximum length
   * @returns Truncated string
   */
  export const truncateString = (str: string, length = 30): string => {
    if (!str || str.length <= length) return str;
    return `${str.substring(0, length)}...`;
  };
  
  /**
   * Convert a query string object to a URL query string
   * @param params The params object
   * @returns URL query string
   */
  export const objectToQueryString = (params: Record<string, any>): string => {
    const queryParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
      
    return queryParams ? `?${queryParams}` : '';
  };
  
  /**
   * Convert a string to title case
   * @param str The string to convert
   * @returns Title cased string
   */
  export const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };