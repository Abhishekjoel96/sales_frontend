// backend/src/services/callService.ts
import twilioService from './twilioService';
import { createCallLog, updateCallLog, getCallLogById, getCallLogs } from '../models/CallLog';
import { CallLog } from '../models/CallLog';
import openaiService from './openaiService';
import logger from '../utils/logger';
import { updateLead } from '../models/Lead';
import { getAISettingsByChannel } from '../models/AISettings';
import config from '../config/config';

export const makeCall = async (to: string, leadId: string, language: string): Promise<CallLog> => {
    const from = config.twilioPhoneNumber;
    const callLog = await twilioService.makeCall(to, from, leadId, language);
    return callLog;
};

export const handleIncomingCall = async (from: string, to: string): Promise<string> => {
    // 1.  Determine the language
    const language = 'en-US'; // Default to English, consider fetching from lead if available

    // 2. Generate the initial Twilio response (Twiml)
    const twiml = await openaiService.generateContextForTwilio(language)

    return twiml;

  }

export const handleCallWebhook = async (twilioCallSid: string, callStatus: string, callDuration?: string, recordingUrl?: string) => {
    return twilioService.handleCallWebhook(twilioCallSid, callStatus, callDuration, recordingUrl);
};
export const getAllCallLogs = async (): Promise<CallLog[]> => {
    return getCallLogs()
}

export const getCallLog = async(id: string): Promise<CallLog> => {
    return getCallLogById(id);
}

export const transcribeCall = async (callLogId: string): Promise<CallLog> => {
    try {
        const callLog = await getCallLogById(callLogId);
        if (!callLog || !callLog.recording_url) {
          throw new Error('Call log not found or no recording URL');
        }

        const audioFile = await downloadRecording(callLog.recording_url);
        const transcription = await openaiService.transcribeAudio(audioFile);

        const settings = await getAISettingsByChannel('Call');
        const prompt = `Summarize the following call transcript:\n\n${transcription}`;
        const summary = await openaiService.generateText(prompt, 'gpt-3.5-turbo', settings.context || undefined);

        const updatedCallLog = await updateCallLog(callLogId, { transcription, summary });
          //Update Lead Status After transcript
          await updateLead(callLog.lead_id, {status: 'Warm'}) //Updating the lead to warm
        return updatedCallLog;

      } catch (error:any) {
        logger.error('Error transcribing call:', error);
        throw new Error('Failed to transcribe call: ' + error.message);
      }
};

// Helper function to download recordings
async function downloadRecording(url: string): Promise<Buffer> {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
