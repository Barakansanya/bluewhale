// ============================================
// FILE: server/src/controllers/ai.controller.ts
// ============================================
import { Request, Response } from 'express';
import { AIService } from '../services/ai.service';

const aiService = new AIService();

export const analyzeSentiment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const result = await aiService.analyzeSentiment(text);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Sentiment analysis error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const summarizeReport = async (req: Request, res: Response) => {
  try {
    const { reportText, companyName } = req.body;
    
    if (!reportText || !companyName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Report text and company name are required' 
      });
    }

    const result = await aiService.summarizeReport(reportText, companyName);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Report summary error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const calculateDCF = async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    if (!params.currentRevenue || !params.revenueGrowthRate || !params.discountRate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required DCF parameters' 
      });
    }

    const result = await aiService.calculateDCF(params);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('DCF calculation error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const answer = await aiService.askQuestion(question, context || '');
    return res.status(200).json({ success: true, data: { answer } });
  } catch (error: any) {
    console.error('Question answering error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};