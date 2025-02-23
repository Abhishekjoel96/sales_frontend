
// backend/src/services/masterAgentService.ts
import { getLeads, Lead } from '../models/Lead';
import { getCallLogs, CallLog } from '../models/CallLog';
import { getMessages, Message } from '../models/Message';
import { getAppointments, Appointment } from '../models/Appointment';
import openaiService from './openaiService';
import logger from '../utils/logger';

class MasterAgentService {

    async getDashboardData(): Promise<any> {
        try {
            const leads = await getLeads();
            const callLogs = await getCallLogs();
            const messages = await getMessages();
            //const appointments = await getAppointments(); // Might not be directly needed in the dashboard data

            const activeLeads = this.calculateActiveLeads(leads, messages);
            const aiCallsToday = this.calculateAICallsToday(callLogs);
            const autoReplies = this.calculateAutoReplies(messages);
            const conversionRate = this.calculateConversionRate(leads);
            const recentActivities = this.generateRecentActivities(leads, callLogs, messages);
            const leadPipeline = this.generateLeadPipeline(leads);

            return {
                activeLeads,
                aiCallsToday,
                autoReplies,
                conversionRate,
                recentActivities,
                leadPipeline,
};

        } catch (error: any) {
            logger.error('Error fetching dashboard data:', error);
            throw new Error('Failed to fetch dashboard data: ' + error.message);
        }
    }
  private calculateActiveLeads(leads: Lead[], messages: Message[]): any {
        const activeLeads = new Map();

        // Iterate through messages to find leads with recent activity
        messages.forEach(message => {
            const lead = leads.find(l => l.id === message.lead_id);
            if (lead) {
                // Use a Map to store the latest message timestamp for each lead
                if (!activeLeads.has(lead.id) || activeLeads.get(lead.id).timestamp < message.timestamp) {
                    activeLeads.set(lead.id, { lead, timestamp: message.timestamp, source: message.channel });
                }
            }
        });

        // Convert the Map values to an array and format the output
        const result = Array.from(activeLeads.values()).map(item => ({
            name: item.lead.name,
            source: item.source,
        }));

        return { count: result.length, details: result };
    }

    private calculateAICallsToday(callLogs: CallLog[]): { total: number; incoming: number; outgoing: number } {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        let total = 0;
        let incoming = 0;
        let outgoing = 0;

        callLogs.forEach(callLog => {
            if (callLog.timestamp.startsWith(today)) {
                total++;
                if (callLog.direction === 'Inbound') {
                    incoming++;
                } else {
                    outgoing++;
                }
            }
        });

        return { total, incoming, outgoing };
    }

  private calculateAutoReplies(messages: Message[]): { total: number; whatsapp: number; sms: number; email: number } {
    let total = 0;
    let whatsapp = 0;
    let sms = 0;
    let email = 0;

    messages.forEach((message) => {
      if (message.direction === "Outbound") {
        total++;
        switch (message.channel) {
          case "WhatsApp":
            whatsapp++;
            break;
          case "SMS":
            sms++;
            break;
          case "Email":
            email++;
            break;
        }
      }
    });

    return { total, whatsapp, sms, email };
  }

    private calculateConversionRate(leads: Lead[]): number {
        const totalLeads = leads.length;
        const hotLeads = leads.filter(lead => lead.status === 'Hot').length;

        if (totalLeads === 0) {
            return 0;
        }

        return parseFloat(((hotLeads / totalLeads) * 100).toFixed(2));
    }

    private generateRecentActivities(leads: Lead[], callLogs: CallLog[], messages: Message[]): any[] {
       const activities = [];

        // Add lead creation activities
        for (const lead of leads) {
            activities.push({
                type: 'Lead Added',
                detail: `Lead added: ${lead.name} (${lead.phone_number}) - Source: ${lead.source}`,
                timestamp: lead.created_at
            });
             if (lead.status) {
                activities.push({
                    type: 'Lead Status Update',
                    detail: `Lead status changed to ${lead.status}: ${lead.name}  - Source: ${lead.source}`,
                    timestamp: lead.updated_at,
                });
            }
        }

        // Add call log activities
        for (const callLog of callLogs) {
            const lead = leads.find(l => l.id === callLog.lead_id); // Find the lead associated with this call
            if(lead){
                activities.push({
                    type: callLog.direction === 'Inbound' ? 'Incoming Call' : 'Outgoing Call',
                    detail: `${callLog.direction === 'Inbound' ? 'Incoming call from' : 'Outgoing call to'} ${lead.name} (${lead.phone_number}): ${callLog.status}`,
                    timestamp: callLog.timestamp
                });
            }
        }

        // Add message activities
        for (const message of messages) {
             const lead = leads.find(l => l.id === message.lead_id);
             if(lead){
                activities.push({
                    type: `${message.channel} Message`,
                    detail: `${message.direction === 'Inbound' ? 'Received' : 'Sent'} ${message.channel} message ${message.direction === 'Inbound'? 'from' : 'to'}: ${lead.name} (${message.channel === 'Email' ? lead.email : lead.phone_number}): ${message.content.substring(0, 20)}...`,
                    timestamp: message.timestamp
                  });
             }
        }

        // Sort activities by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return activities.slice(0, 10); // Return only the 10 most recent activities
    }

    private generateLeadPipeline(leads: Lead[]): any {
      const pipeline = {
        New: [] as any[],
        Cold: [] as any[],
        Warm: [] as any[],
        Hot: [] as any[],
      };

      leads.forEach((lead) => {
        const leadInfo = {
          name: lead.name,
          phone_number: lead.phone_number,
        };

        switch (lead.status) {
          case "New":
            pipeline.New.push(leadInfo);
            break;
          case "Cold":
            pipeline.Cold.push(leadInfo);
            break;
          case "Warm":
            pipeline.Warm.push(leadInfo);
            break;
          case "Hot":
            pipeline.Hot.push(leadInfo);
            break;
        }
      });

      return pipeline;
    }

    async getRagData(query: string): Promise<string> {
        // 1.  Get all relevant data (leads, call logs, messages)
        const leads = await getLeads();
        const callLogs = await getCallLogs();
        const messages = await getMessages();


        // 2.  Combine and format the data into a single string (or array of strings)
        let context = "Leads:\n";
        leads.forEach(lead => {
            context += `ID: ${lead.id}, Name: ${lead.name}, Phone: ${lead.phone_number}, Email: ${lead.email}, Status: ${lead.status}, Source: ${lead.source}, Region: ${lead.region}\n`;
        });

        context += "\nCall Logs:\n";
        callLogs.forEach(log => {
          const lead = leads.find((l) => l.id === log.lead_id);
          if(lead){
            context += `Lead: ${lead.name}, Status: ${log.status}, Duration: ${log.duration}, Transcription: ${log.transcription}, Summary: ${log.summary}\n`;

          }
        });

        context += "\nMessages:\n";
        messages.forEach(msg => {
            const lead = leads.find((l) => l.id === msg.lead_id);
            if(lead){
              context += `Lead: ${lead.name}, Channel: ${msg.channel}, Direction: ${msg.direction}, Content: ${msg.content}\n`;
            }
        });

        // 3. Create the prompt of AI assistant
        const systemPrompt = "You are a helpful AI assistant that provides information based on the provided data. Answer the user's query concisely and accurately based *solely* on the context provided. Do not hallucinate or make up information. If the answer is not in the context, say 'I don't have information about that.'";
        const prompt = `${context}\n\nQuery: ${query}`;

        // 4.  Use OpenAI to generate a response using the combined data as context
        const aiResponse = await openaiService.generateText(prompt, 'gpt-4-turbo-preview', systemPrompt);
        return aiResponse;

    }
}

export default new MasterAgentService();