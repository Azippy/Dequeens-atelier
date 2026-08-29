const generateOrderNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `DQ-${timestamp}-${random}`;
};

export default generateOrderNumber;
