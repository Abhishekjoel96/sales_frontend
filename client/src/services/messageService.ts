// backend/src/services/messageService.ts
import twilioService from './twilioService';
import mailgunService from './mailgunService';
import { createMessage, getMessages, getMessageById, updateMessage, getMessagesByLeadId, getMessagesByChannelAndLeadId, Message } from '../models/Message';
import openaiService from './openaiService';
import { getLeadById, updateLead } from '../models/Lead';
import { createAppointment, Appointment } from '../models/Appointment';
import logger from '../utils/logger';
import { getAISettingsByChannel } from '../models/AISettings';
import { isOutOfOffice } from '../utils/helpers';
import { getLeadByPhoneNumber, getLeadByEmail} from '../models/Lead'
import OpenAI from 'openai';

export const sendMessage = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email', messageContent: string): Promise<Message> => {
    const lead = await getLeadById(leadId);
    if (!lead) {
        throw new Error('Lead not found');
    }

    let messageResponse;
    try {
        switch (channel) {
            case 'WhatsApp':
                messageResponse = await twilioService.sendWhatsAppMessage(lead.phone_number, messageContent, leadId);
                break;
            case 'SMS':
                messageResponse = await twilioService.sendSMS(lead.phone_number, messageContent, leadId);
                break;
            case 'Email':
                const subject = "Regarding your inquiry with BusinessOn.ai";
                messageResponse = await mailgunService.sendEmail(lead.email!, subject, messageContent);
                break;
            default:
                throw new Error('Invalid channel');
        }
        const messageData: Omit<Message, 'id' | 'timestamp'> = {
          lead_id: leadId,
          channel: channel,
          direction: 'Outbound', // Since we're sending the message
          content: messageContent,
        }

        const createdMessage = await createMessage(messageData);
        return createdMessage;

    } catch (error: any) {
        logger.error(`Error sending ${channel} message:`, error);
        throw new Error(`Failed to send ${channel} message: ${error.message}`);
    }
};

export const receiveMessage = async (leadId: string, channel: 'WhatsApp' | 'SMS' | 'Email', messageContent: string): Promise<Message> => {

      if (isOutOfOffice()) {
        const outOfOfficeMessage = "Thank you for your message. We are currently out of the office and will respond to you as soon as possible.";
        await sendMessage(leadId, channel, outOfOfficeMessage);
        const messageData: Omit<Message, 'id' | 'timestamp'> = {
          lead_id: leadId,
          channel: channel,
          direction: 'Inbound',
          content: messageContent,
        }
          const createdMessage = await createMessage(messageData)
        return createdMessage;

    }
      const messageData: Omit<Message, 'id' | 'timestamp'> = {
          lead_id: leadId,
          channel: channel,
          direction: 'Inbound',
          content: messageContent,
        }
    const createdMessage = await createMessage(messageData);
    const lead = await getLeadById(leadId);
    if(!lead){
      throw new Error("Lead Not found");
    }
    const aiSettings = await getAISettingsByChannel(channel);

    const prompt = `Lead ID: ${leadId}\nChannel: ${channel}\nMessage: ${messageContent}\n`;
    const systemMessage = aiSettings.context || `You are a helpful assistant for BusinessOn.ai.  Your goal is to help qualify leads and schedule appointments. Be ${aiSettings.tone} and ${aiSettings.style}.`;

      // Create conversation history for RAG
      const conversationHistory = await getMessagesByChannelAndLeadId(leadId, channel);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {role: "system", content: systemMessage},
        ...conversationHistory.map(msg => ({
          role: msg.direction === 'Inbound' ? "user" as const : "assistant" as const, //Corrected type
          content: msg.content,
        })),
          {role: "user", content: messageContent} // The new incoming message
      ];

    const aiResponse = await openaiService.generateChatResponse(messages, 'gpt-3.5-turbo');

    await sendMessage(leadId, channel, aiResponse);

    if (aiResponse.toLowerCase().includes('book an appointment')) {
        const appointmentRegex = /(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/; // Example: 2024-03-15 10:30
        const match = aiResponse.match(appointmentRegex);

        if (match) {
            const dateStr = match[1];
            const timeStr = match[2];
            const dateTimeStr = `${dateStr}T${timeStr}:00`;

            const appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'> = { // Explicit type
                lead_id: leadId,
                date_time: dateTimeStr,
                source: channel, // Source is the channel
                status: 'Scheduled',
            };

        try{
             await createAppointment(appointmentData);
             await updateLead(leadId, {status: 'Hot'})
             await sendMessage(leadId, channel, `Great, your appointment is booked for ${dateTimeStr}. Please confirm or let us know if you'd like to reschedule.`);
            } catch(error: any) {
                if (error.message.includes('overlaps')) {
                    await sendMessage(leadId, channel, `Sorry, the requested time slot is unavailable. Please suggest an alternative time.`);
                  } else {
                    await sendMessage(leadId, channel, 'Sorry, there was an issue booking your appointment. Please try again or contact us directly.');
                  }

            }
        } else {
            await sendMessage(leadId, channel, 'Could you please specify the date and time you would like to book the appointment?');
        }
    } else {
        await updateLead(leadId, {status: 'Warm'});
    }
      if(!aiResponse.toLowerCase().includes('book an appointment')){
        setTimeout(async()=> {
           const latestMessage = await getMessagesByChannelAndLeadId(leadId, channel);
           const lastMessage = latestMessage[latestMessage.length - 1];

            if(lastMessage && lastMessage.direction === 'Outbound'){
              await sendMessage(leadId, channel, 'We have not received a response from you yet. Is there anything else I can assist you with?');
              await updateLead(leadId, {status: "Warm"})
            }
        }, 24*60*60*1000) //24 hours
    }
     if(aiResponse.toLowerCase().includes('connect to agent')){
         const message = `The client is asking to connect to a agent. Lead Id ${leadId}`;
         await sendMessage(leadId, channel, "Please wait while I connect you to an agent.");
     }

      return createdMessage;
};
export const getAllMessages = async(): Promise<Message[]> => {
    return getMessages();
}

export const getMessage = async (id:string):Promise<Message> => {
    return getMessageById(id)
}
