export const welcomeEmail = (name) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Welcome to DeQueens Atelier, ${name}!</h2>

    <p>
      Thank you for creating an account with DeQueens Atelier.
    </p>

    <p>
      Discover our fashion collections, ready-to-wear pieces,
      bespoke designs and more.
    </p>

    <p>
      We look forward to creating something beautiful for you.
    </p>

    <p>
      <strong>DeQueens Atelier</strong>
    </p>
  </div>
`;

export const orderConfirmationEmail = ({ name, orderNumber, totalAmount }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Order Confirmed 🎉</h2>

    <p>Hello ${name},</p>

    <p>
      Your order has been successfully confirmed.
    </p>

    <p>
      <strong>Order Number:</strong> ${orderNumber}
    </p>

    <p>
      <strong>Total:</strong> ₦${Number(totalAmount).toLocaleString()}
    </p>

    <p>
      We will keep you updated as your order progresses.
    </p>

    <p>
      Thank you for choosing DeQueens Atelier.
    </p>
  </div>
`;
export const paymentConfirmationEmail = ({
  name,
  orderNumber,
  amount,
  reference,
}) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Payment Successful ✅</h2>

    <p>Hello ${name},</p>

    <p>
      We have successfully received your payment.
    </p>

    <p>
      <strong>Order:</strong> ${orderNumber}
    </p>

    <p>
      <strong>Amount:</strong>
      ₦${Number(amount).toLocaleString()}
    </p>

    <p>
      <strong>Payment Reference:</strong>
      ${reference}
    </p>

    <p>
      Your order is now being processed.
    </p>

    <p>
      <strong>DeQueens Atelier</strong>
    </p>
  </div>
`;
export const bespokeRequestEmail = ({ name, requestNumber }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Custom Design Request Received 👗</h2>

    <p>Hello ${name},</p>

    <p>
      We have received your bespoke design request.
    </p>

    <p>
      <strong>Request Number:</strong>
      ${requestNumber}
    </p>

    <p>
      Our fashion team will review your request and
      get back to you with the next steps.
    </p>

    <p>
      Thank you for choosing DeQueens Atelier.
    </p>
  </div>
`;
export const apprenticeshipReceivedEmail = ({ name, applicationNumber }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Apprenticeship Application Received 🎓</h2>

    <p>Hello ${name},</p>

    <p>
      Thank you for applying to become an apprentice
      at DeQueens Atelier.
    </p>

    <p>
      <strong>Application Number:</strong>
      ${applicationNumber}
    </p>

    <p>
      Your application is currently under review.
    </p>

    <p>
      We will contact you once a decision has been made.
    </p>
  </div>
`;
export const apprenticeshipDecisionEmail = ({ name, status, adminNote }) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Apprenticeship Application Update</h2>

    <p>Hello ${name},</p>

    <p>
      Your DeQueens Atelier apprenticeship application
      has been updated.
    </p>

    <p>
      <strong>Status:</strong> ${status}
    </p>

    ${
      adminNote
        ? `<p><strong>Message from DeQueens:</strong><br>
           ${adminNote}</p>`
        : ""
    }

    <p>
      DeQueens Atelier
    </p>
  </div>
`;
