const GST_RATE = 0.18;

/**
 * Calculate all financial values for an order server-side.
 * Items should be already validated against DB prices.
 *
 * @param {Array}  items         - [{ price, originalPrice, qty }]
 * @param {string} paymentStatus - 'paid' | 'partial' | 'unpaid'
 * @param {number} paidAmount    - amount received (only used for partial)
 * @returns {Object} subtotal, discount, gst, total, paidAmount, changeDue, balanceDue
 */
const calcFinancials = (items, paymentStatus, paidAmount = 0) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = items.reduce(
    (sum, i) => sum + (i.originalPrice - i.price) * i.qty, 0
  );
  const gst   = parseFloat((subtotal * GST_RATE).toFixed(2));
  const total = parseFloat((subtotal + gst).toFixed(2));

  let paid      = 0;
  let changeDue = 0;
  let balanceDue = 0;

  if (paymentStatus === 'paid') {
    paid       = total;
    changeDue  = 0;
    balanceDue = 0;
  } else if (paymentStatus === 'partial') {
    paid       = Math.min(parseFloat(paidAmount) || 0, total);
    changeDue  = 0;
    balanceDue = parseFloat((total - paid).toFixed(2));
  } else {
    // unpaid — no money collected
    paid       = 0;
    changeDue  = 0;
    balanceDue = total;
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    gst,
    total,
    paidAmount: parseFloat(paid.toFixed(2)),
    changeDue:  parseFloat(changeDue.toFixed(2)),
    balanceDue,
  };
};

module.exports = calcFinancials;