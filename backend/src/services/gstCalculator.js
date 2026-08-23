/**
 * GST Calculation Utility Service
 * Reusable server-side calculation to ensure financial precision and tax compliance.
 */

function calculateItemGst(unitPrice, quantity, gstPercent = 18, discount = 0) {
  const rawSubtotal = unitPrice * quantity;
  const taxableAmount = Math.max(0, rawSubtotal - discount);
  const gstAmount = Number(((taxableAmount * gstPercent) / 100).toFixed(2));
  const lineTotal = Number((taxableAmount + gstAmount).toFixed(2));

  return {
    subtotal: rawSubtotal,
    taxableAmount,
    discount,
    gstPercent,
    gstAmount,
    lineTotal
  };
}

function calculateInvoiceTotals(items = [], flatDiscount = 0, isInterState = false) {
  let subtotal = 0;
  let itemDiscounts = 0;
  let taxableAmount = 0;
  let totalGst = 0;

  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice || item.purchasePrice) || 0;
    const gstPct = Number(item.gstPercent) || 0;
    const disc = Number(item.discount) || 0;

    const calc = calculateItemGst(price, qty, gstPct, disc);

    subtotal += calc.subtotal;
    itemDiscounts += calc.discount;
    taxableAmount += calc.taxableAmount;
    totalGst += calc.gstAmount;

    return {
      ...item,
      quantity: qty,
      unitPrice: price,
      purchasePrice: price,
      gstPercent: gstPct,
      gstAmount: calc.gstAmount,
      discount: calc.discount,
      lineTotal: calc.lineTotal
    };
  });

  const totalDiscount = itemDiscounts + (Number(flatDiscount) || 0);
  const finalTaxable = Math.max(0, taxableAmount - (Number(flatDiscount) || 0));

  // CGST and SGST split (50/50 for Intra-state) vs IGST (Inter-state)
  const cgst = isInterState ? 0 : Number((totalGst / 2).toFixed(2));
  const sgst = isInterState ? 0 : Number((totalGst / 2).toFixed(2));
  const igst = isInterState ? Number(totalGst.toFixed(2)) : 0;

  const grandTotal = Number((finalTaxable + totalGst).toFixed(2));

  return {
    items: processedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discountTotal: Number(totalDiscount.toFixed(2)),
    taxableAmount: Number(finalTaxable.toFixed(2)),
    cgst,
    sgst,
    igst,
    totalGst: Number(totalGst.toFixed(2)),
    grandTotal
  };
}

module.exports = {
  calculateItemGst,
  calculateInvoiceTotals
};
