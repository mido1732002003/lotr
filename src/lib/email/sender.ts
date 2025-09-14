import { EmailTemplate } from './templates';

export interface EmailSender {
  send(to: string, template: EmailTemplate): Promise<void>;
}

/**
 * Console Email Sender (for development/MVP)
 */
export class ConsoleEmailSender implements EmailSender {
  async send(to: string, template: EmailTemplate): Promise<void> {
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', template.subject);
    console.log('Content:', template.text);
    console.log('---');
  }
}

/**
 * SMTP Email Sender (for production)
 */
export class SMTPEmailSender implements EmailSender {
  async send(to: string, template: EmailTemplate): Promise<void> {
    // TODO: Implement actual SMTP sending
    // Using nodemailer or similar
    
    if (!process.env.SMTP_HOST) {
      // Fallback to console in development
      const consoleSender = new ConsoleEmailSender();
      return consoleSender.send(to, template);
    }
    
    // Stub implementation
    console.log(`Would send email via SMTP to ${to}`);
  }
}

// Factory function
export function getEmailSender(): EmailSender {
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return new SMTPEmailSender();
  }
  return new ConsoleEmailSender();
}