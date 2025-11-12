
import { GoogleGenAI, Type } from "@google/genai";
import { TossChoice, DecisionChoice } from '../types';

export const performAIToss = async (teamA: string, teamB: string, call: TossChoice): Promise<{ winner: string; decision: DecisionChoice; narrative: string }> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    const coinFlip = Math.random() > 0.5 ? 'Heads' : 'Tails';
    const decisionFlip = Math.random() > 0.5 ? 'bat' : 'bowl';
    const winner = call === coinFlip ? teamA : teamB;
    return {
        winner,
        decision: decisionFlip as DecisionChoice,
        narrative: `The coin landed on ${coinFlip}. ${winner} won the toss and chose to ${decisionFlip}.`
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Updated prompt to work better with a JSON schema response.
    const prompt = `
      Simulate a cricket coin toss between two teams: "${teamA}" and "${teamB}".
      The call from ${teamA} is "${call}".
      Describe the coin toss with a little flair, like a commentator.
      The outcome should be random.
      Then, provide the result in the requested JSON format.
    `;
    
    // Fix: Use responseSchema for robust JSON handling instead of string manipulation.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              winner: { type: Type.STRING, description: `The winning team, either ${teamA} or ${teamB}.` },
              decision: { type: Type.STRING, description: "The winner's choice, either 'bat' or 'bowl'." },
              narrative: { type: Type.STRING, description: "A dramatic description of the toss and result." },
            },
            required: ['winner', 'decision', 'narrative'],
          },
        },
    });
    
    const text = response.text.trim();
    const result = JSON.parse(text);

    return {
      winner: result.winner,
      decision: result.decision as DecisionChoice,
      narrative: result.narrative,
    };
  } catch (error) {
    console.error("Error with Gemini API, using fallback toss:", error);
    // Fallback in case of API error
    const coinFlip = Math.random() > 0.5 ? 'Heads' : 'Tails';
    const decisionFlip = Math.random() > 0.5 ? 'bat' : 'bowl';
    const winner = call === coinFlip ? teamA : teamB;
    return {
        winner,
        decision: decisionFlip as DecisionChoice,
        narrative: `The coin landed on ${coinFlip}. ${winner} won the toss and chose to ${decisionFlip}.`
    };
  }
};
