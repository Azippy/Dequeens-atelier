const calculateOrderTotal = (items, shippingFee = 0) => {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return {
    subtotal,
    shippingFee,
    totalAmount: subtotal + shippingFee,
  };
};

export default calculateOrderTotal;
