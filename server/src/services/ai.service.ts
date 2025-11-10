// ============================================
// FILE: server/src/services/ai.service.ts
// ============================================

export class AIService {
  private apiKey = process.env.ANTHROPIC_API_KEY || '';
  private apiUrl = 'https://api.anthropic.com/v1/messages';

  async analyzeSentiment(text: string): Promise<{
    sentiment: string;
    score: number;
    explanation: string;
    keyTopics: string[];
  }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Analyze the sentiment of this financial text and respond ONLY with valid JSON (no markdown, no backticks):

Text: "${text}"

Respond in this exact JSON format:
{
  "sentiment": "POSITIVE" or "NEGATIVE" or "NEUTRAL",
  "score": number between -1 and 1,
  "explanation": "brief explanation",
  "keyTopics": ["topic1", "topic2", "topic3"]
}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      // Clean and parse JSON response
      const cleaned = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleaned);
      
      return result;
    } catch (error: any) {
      console.error('AI Sentiment Analysis Error:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  async summarizeReport(reportText: string, companyName: string): Promise<{
    summary: string;
    keyPoints: string[];
    riskFactors: string[];
    opportunities: string[];
  }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `Analyze this financial report for ${companyName} and provide a concise summary. Respond ONLY with valid JSON (no markdown):

Report excerpt: "${reportText.substring(0, 3000)}"

Respond in this exact JSON format:
{
  "summary": "2-3 sentence executive summary",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "riskFactors": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      const cleaned = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleaned);
      
      return result;
    } catch (error: any) {
      console.error('AI Report Summary Error:', error);
      throw new Error('Failed to summarize report');
    }
  }

  async calculateDCF(params: {
    currentRevenue: number;
    revenueGrowthRate: number;
    terminalGrowthRate: number;
    discountRate: number;
    projectionYears: number;
  }): Promise<{
    fairValue: number;
    projectedRevenues: number[];
    terminalValue: number;
    presentValue: number;
    explanation: string;
  }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [
            {
              role: 'user',
              content: `Calculate a DCF valuation with these parameters and respond ONLY with valid JSON (no markdown):

Current Revenue: R${params.currentRevenue}M
Revenue Growth Rate: ${params.revenueGrowthRate}%
Terminal Growth Rate: ${params.terminalGrowthRate}%
Discount Rate: ${params.discountRate}%
Projection Years: ${params.projectionYears}

Calculate the fair value and respond in this exact JSON format:
{
  "fairValue": number,
  "projectedRevenues": [array of projected revenues],
  "terminalValue": number,
  "presentValue": number,
  "explanation": "brief explanation of the calculation"
}`
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.content[0].text;
      
      const cleaned = content.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleaned);
      
      return result;
    } catch (error: any) {
      console.error('AI DCF Calculation Error:', error);
      throw new Error('Failed to calculate DCF');
    }
  }

  async askQuestion(question: string, context: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `Context: ${context}

Question: ${question}

Provide a clear, concise answer based on the context provided.`
            }
          ]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error: any) {
      console.error('AI Question Error:', error);
      throw new Error('Failed to answer question');
    }
  }
}