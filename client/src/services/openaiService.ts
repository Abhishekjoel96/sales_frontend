// backend/src/services/openaiService.ts
import OpenAI from 'openai';
import config from '../config/config';
import logger from '../utils/logger';
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'openai/resources';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }
  async generateContextForTwilio(language: string) {
        try{
            const systemPrompt = `
            You are the phone agent for BusinessOn.ai.

            1. Greet the user.
            2. Inform the user that you're from BusinessOn.ai
            3. ask for language perference.
            4. After language selection, proceed in the chosen language.
            5. ask for appointment or assistance
            `;

            let userPrompt = `Greet the user, and ask to select language for perference:
                Select 1 for English.
                Select 2 for French
                Select 3 for German
                Select 4 for Spanish
                Select 5 for Italian
            `;

            if(language === 'fr-FR'){
              userPrompt = `Accueillez l'utilisateur et demandez-lui de sélectionner la langue de préférence :
                Sélectionnez 1 pour l'anglais.
                Sélectionnez 2 pour le français
                Sélectionnez 3 pour l'allemand
                Sélectionnez 4 pour l'espagnol
                Sélectionnez 5 pour l'italien`
            } else if(language === 'de-DE'){
              userPrompt = `Begrüßen Sie den Benutzer und bitten Sie ihn, die Sprache auszuwählen:
                Wählen Sie 1 für Englisch.
                Wählen Sie 2 für Französisch
                Wählen Sie 3 für Deutsch
                Wählen Sie 4 für Spanisch
                Wählen Sie 5 für Italienisch`
            } else if(language === 'es-ES'){
                userPrompt = `Saluda al usuario y pídele que seleccione el idioma de preferencia:
                Seleccione 1 para inglés.
                Seleccione 2 para francés
                Seleccione 3 para alemán
                Seleccione 4 para español
                Seleccione 5 para italiano`
            }else if(language === 'it-IT'){
              userPrompt = `Saluta l'utente e chiedigli di selezionare la lingua preferita:
                Seleziona 1 per l'inglese.
                Seleziona 2 per il francese
                Seleziona 3 per il tedesco
                Seleziona 4 per lo spagnolo
                Seleziona 5 per l'italiano`
            }

          const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ];

            const request: ChatCompletionCreateParamsNonStreaming = {
                model: 'gpt-3.5-turbo',
                messages: messages,
                temperature: 0.6,
                response_format: {type: "text"}
            }

            const completion = await this.openai.chat.completions.create(request);
            const response = completion.choices[0].message?.content;

          if(!response) {
            throw new Error("Couldn't get twilio context")
          }
          let twiml = `<Response><Say>${response}</Say><Gather numDigits="1" action="/twiml?step=language&amp;language=${language}" method="POST">`;

        if (language === 'en-US') {
          twiml += '<Say>Press 1 for English, 2 for French, 3 for German, 4 for Spanish, 5 for Italian.</Say></Gather>';
        } else if (language === 'fr-FR') {
          twiml += '<Say>Appuyez sur 1 pour l\'anglais, 2 pour le français, 3 pour l\'allemand, 4 pour l\'espagnol, 5 pour l\'italien.</Say></Gather>';
        } else if (language === 'de-DE') {
          twiml += '<Say>Drücken Sie 1 für Englisch, 2 für Französisch, 3 für Deutsch, 4 für Spanisch, 5 für Italienisch.</Say></Gather>';
        } else if (language === 'es-ES') {
          twiml += '<Say>Presione 1 para inglés, 2 para francés, 3 para alemán, 4 para español, 5 para italiano.</Say></Gather>';
        } else if(language === 'it-IT'){
          twiml+= '<Say>Premi 1 per l\'inglese, 2 per il francese, 3 per il tedesco, 4 per lo spagnolo, 5 per l\'italiano.</Say></Gather>'
        }

        twiml += '<Say>We didn\'t receive any input. Goodbye!</Say></Response>';

        return twiml;


        } catch(error: any){
            logger.error('Error generating twilio functions', error)
            throw new Error("Failed to generate twilio functions " + error.message)
        }
  }
  async transcribeAudio(audioFile: Buffer): Promise<string> {
    try {
      // The audioFile needs to be a File object, which isn't directly possible
      // in Node.js.  We use a workaround, creating a Blob, then converting
      // it to something the OpenAI API accepts.
      const blob = new Blob([audioFile], { type: 'audio/webm' }); // Adjust MIME type if needed

      const transcriptionResponse = await this.openai.audio.transcriptions.create({
          file: new File([blob], "audio.webm"), // Adjust file name if needed
          model: "whisper-1",
      });
      return transcriptionResponse.text;

    } catch (error: any) {
      logger.error('Error transcribing audio with Whisper:', error);
      throw new Error('Failed to transcribe audio: ' + error.message);
    }
  }

  async generateText(prompt: string, model: 'gpt-3.5-turbo' | 'gpt-4-turbo-preview' = 'gpt-3.5-turbo', systemMessage: string = "You are a helpful assistant."): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
            {role: "system", content: systemMessage},
            {role: "user", content: prompt}
        ],
        model: model,
        temperature: 0.7, // Adjust as needed
        max_tokens: 150,  // Adjust as needed
      });

      const response = completion.choices[0].message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }
      return response;
    } catch (error: any) {
      logger.error('Error generating text with OpenAI:', error);
      throw new Error('Failed to generate text: ' + error.message);
    }
  }

    async generateChatResponse(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], model: 'gpt-3.5-turbo' | 'gpt-4-turbo-preview' = 'gpt-3.5-turbo'): Promise<string> {
    try {
        const completion = await this.openai.chat.completions.create({
            messages: messages,
            model,
            temperature: 0.7,
      });
      const response = completion.choices[0].message?.content;

       if (!response) {
        throw new Error("No response from OpenAI");
      }
      return response;
    } catch (error:any) {
      logger.error('Error generating response', error);
      throw new Error('Failed to generate AI response: '+ error.message);

    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try{
      const response = await this.openai.embeddings.create({
        input: text,
        model: 'text-embedding-ada-002',
      })
      return response.data[0].embedding;
    } catch(error: any){
      logger.error('Error in generating embeddings', error);
      throw new Error('Failed to generate embedding:'+ error.message);
    }
  }
}

export default new OpenAIService();
