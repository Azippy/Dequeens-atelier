const generateRequestNumber = () => {
  const timestamp = Date.now();

  const random = Math.floor(1000 + Math.random() * 9000);

  return `DQ-BS-${timestamp}-${random}`;
};

export default generateRequestNumber;
