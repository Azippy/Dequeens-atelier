const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Paystack request failed");
  }

  return data;
};

export default paystackRequest;
