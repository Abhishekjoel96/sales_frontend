// backend/src/services/twilioService.ts
import twilio, { Twilio } from 'twilio';
import config from '../config/config';
import { CallLog, createCallLog, updateCallLog } from '../models/CallLog';
import logger from '../utils/logger';
import { updateLead } from '../models/Lead';
import supabase from '../utils/db';


class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = twilio(config.twilioAccountSid, config.twilioAuthToken);
  }

  async makeCall(to: string, from: string, leadId: string, language: string = 'en-US'): Promise<CallLog> {
    try {
      // Construct the TwiML URL with the language parameter
      const twimlUrl = `/twiml?language=${language}`;


      const call = await this.client.calls.create({
        to,
        from,
        url: twimlUrl, // Use the URL with the language
        method: 'POST',
        statusCallback: `${process.env.DEPLOYED_URL || 'http://localhost:3001'}/api/calls/webhook`,  // Your webhook endpoint
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed', 'failed', 'busy', 'no-answer'],
        record: true, // Enable call recording

      });

      // Create a call log entry
      const callLogData: Omit<CallLog, 'id' | 'timestamp'> = {
        lead_id: leadId,
        twilio_call_sid: call.sid,
        status: 'initiated', // Initial status
        direction: 'Outbound',
        recording_url: null,  // Will be updated by the webhook
        duration: null,
        transcription: null,
        summary: null
      };

      const callLog = await createCallLog(callLogData);
      return callLog;

    } catch (error: any) {
      logger.error('Error making call with Twilio:', error);
      throw new Error('Failed to make call: ' + error.message);
    }
  }

    async sendWhatsAppMessage(to: string, body: string, leadId: string): Promise<any> {
        try {
            const message = await this.client.messages.create({
                body,
                from: `whatsapp:${config.twilioPhoneNumber}`,
                to: `whatsapp:${to}`,
            });

            return message;

        } catch(error: any) {
            logger.error('Error sending WhatsApp message with Twilio', error);
            throw new Error('Failed to send WhatsApp message: ' + error.message)
        }
    }


  async sendSMS(to: string, body: string, leadId: string): Promise<any> {
    try {
      const message = await this.client.messages.create({
        body,
        from: config.twilioPhoneNumber,
        to,
      });

      return message;
    } catch (error: any) {
      logger.error('Error sending SMS with Twilio:', error);
      throw new Error('Failed to send SMS: ' + error.message);
    }
  }
  async handleCallWebhook(twilioCallSid: string, callStatus: string, callDuration?: string, recordingUrl?: string): Promise<void> {
        try {
            // Find the call log entry by Twilio Call SID
            const { data: callLogs, error: selectError } = await supabase
                .from('CallLogs')
                .select('*')
                .eq('twilio_call_sid', twilioCallSid)
                .single();


            if (selectError) {
                throw new Error(selectError.message);
            }

            if (!callLogs) {
                throw new Error(`Call log not found for Twilio Call SID: ${twilioCallSid}`);
            }
             const callLog = callLogs as CallLog

            // Prepare the update data
            let updateData: Partial<CallLog> = {
                status: callStatus as CallLog['status'],

            };

            if (callDuration) {
               updateData.duration = parseInt(callDuration, 10);

            }
            if(recordingUrl){
                updateData.recording_url = recordingUrl
            }

            // Update the call log entry
            await updateCallLog(callLog.id, updateData);
              if(callStatus === 'completed' || callStatus === 'no-answer' || callStatus ==='failed' || callStatus === 'busy'){
                await updateLead(callLog.lead_id, {status:'Warm'}) // updating the lead to warm
              }

        } catch (error: any) {
            logger.error('Error handling call webhook:', error);
            throw new Error('Failed to handle call webhook: ' + error.message);
        }
    }
}

export default new TwilioService();