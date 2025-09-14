export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function ticketPurchaseConfirmation(data: {
  ticketNumber: string;
  drawTitle: string;
  amount: number;
  currency: string;
  walletAddress: string;
}): EmailTemplate {
  return {
    subject: `Ticket Purchase Confirmation - ${data.ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .ticket-number { font-size: 24px; font-weight: bold; color: #0ea5e9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LOTR Lottery</h1>
            </div>
            <div class="content">
              <h2>Ticket Purchase Confirmed!</h2>
              <p>Thank you for your purchase. Your ticket has been successfully registered.</p>
              
              <p>Ticket Number: <span class="ticket-number">${data.ticketNumber}</span></p>
              
              <h3>Purchase Details:</h3>
              <ul>
                <li>Draw: ${data.drawTitle}</li>
                <li>Amount: ${data.amount} ${data.currency}</li>
                <li>Wallet: ${data.walletAddress}</li>
              </ul>
              
              <p>Good luck!</p>
            </div>
            <div class="footer">
              <p>© 2024 LOTR Lottery. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      LOTR Lottery - Ticket Purchase Confirmed
      
      Ticket Number: ${data.ticketNumber}
      
      Purchase Details:
      - Draw: ${data.drawTitle}
      - Amount: ${data.amount} ${data.currency}
      - Wallet: ${data.walletAddress}
      
      Good luck!
    `,
  };
}

export function winnerNotification(data: {
  ticketNumber: string;
  drawTitle: string;
  prizeAmount: number;
  currency: string;
  walletAddress: string;
}): EmailTemplate {
  return {
    subject: '🎉 Congratulations! You Won the LOTR Lottery!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .prize-amount { font-size: 36px; font-weight: bold; color: #22c55e; text-align: center; }
            .cta-button { display: inline-block; padding: 15px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 CONGRATULATIONS! 🎉</h1>
              <h2>You're a Winner!</h2>
            </div>
            <div class="content">
              <p class="prize-amount">${data.prizeAmount} ${data.currency}</p>
              
              <p>Your ticket <strong>${data.ticketNumber}</strong> has won the ${data.drawTitle}!</p>
              
              <h3>Next Steps:</h3>
              <ol>
                <li>Your prize will be sent to your wallet address: ${data.walletAddress}</li>
                <li>Processing typically takes 24-48 hours</li>
                <li>You'll receive a confirmation once the transfer is complete</li>
              </ol>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.APP_URL}" class="cta-button">View Your Account</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      🎉 CONGRATULATIONS! You Won the LOTR Lottery!
      
      Prize Amount: ${data.prizeAmount} ${data.currency}
      
      Your ticket ${data.ticketNumber} has won the ${data.drawTitle}!
      
      Your prize will be sent to: ${data.walletAddress}
      Processing typically takes 24-48 hours.
      
      Congratulations again!
    `,
  };
}