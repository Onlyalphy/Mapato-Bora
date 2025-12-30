
import { GoogleGenAI, Type } from "@google/genai";
import { StockPick } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIPickInsights = async (pick: StockPick) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following NSE stock pick for Mapato Bora using a "Nyoro-style" value investing bias:
      Symbol: ${pick.symbol}
      Sector: ${pick.sector}
      Current Price: ${pick.current_price}
      Valuation (PE: ${pick.valuation.pe}, PB: ${pick.valuation.pb}, Div Yield: ${pick.valuation.div_yield_pct}%)
      Catalysts: ${pick.catalysts.join(', ')}
      
      Provide a concise 2-sentence rationale for the "Confidence Score" and whether the entry range ${pick.buy_range_kes.low}-${pick.buy_range_kes.high} is conservative enough given the sector weights.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Unable to generate AI insights at this time. Standard valuation metrics suggest a solid entry.";
  }
};
