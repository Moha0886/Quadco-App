// Nigerian Naira currency formatting and tax calculation utilities

/**
 * Format amount in Nigerian Naira
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format amount in Nigerian Naira without symbol (for inputs)
 */
export function formatNairaAmount(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate tax amount based on subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
  return (subtotal * taxRate) / 100;
}

/**
 * Calculate line item totals with tax
 */
export function calculateLineItemTotals(
  quantity: number,
  unitPrice: number,
  taxRate: number = 0
): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = quantity * unitPrice;
  const taxAmount = calculateTax(subtotal, taxRate);
  const total = subtotal + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate document totals from line items
 */
export function calculateDocumentTotals(lineItems: Array<{
  subtotal: number;
  taxAmount: number;
  total: number;
}>): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = lineItems.reduce((sum, item) => sum + item.total, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Common Nigerian tax rates
 */
export const NIGERIAN_TAX_RATES = {
  VAT: 7.5, // Value Added Tax
  WHT_SERVICES: 5, // Withholding Tax on Services
  WHT_GOODS: 2.5, // Withholding Tax on Goods
  NONE: 0,
} as const;

/**
 * Get tax rate from product or service
 */
export function getTaxRate(item: { taxable?: boolean; taxRate?: number }): number {
  if (!item.taxable) return 0;
  return item.taxRate || NIGERIAN_TAX_RATES.VAT;
}
