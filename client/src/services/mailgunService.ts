// backend/src/services/mailgunService.ts
import formData from 'form-data';
import Mailgun from 'mailgun.js';
import config from '../config/config';
import logger from '../utils/logger';

class MailgunService {
  private mailgun: any;

  constructor() {
    const mailgun = new Mailgun(formData)
    this.mailgun = mailgun.client({username: 'api', key: config.mailgunApiKey});
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<any> {
    try {
      const messageData = {
        from: config.mailgunFromEmail,
        to,
        subject,
        text,
        html, // Optional HTML content
      };

      const msg = await this.mailgun.messages.create(config.mailgunDomain, messageData);
      return msg;
    } catch (error: any) {
      logger.error('Error sending email with Mailgun:', error);
      throw new Error('Failed to send email: ' + error.message);
    }
  }
}

export default new MailgunService();