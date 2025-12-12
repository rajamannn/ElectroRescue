
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ProjectIdea } from "../types";

// Schema definition for the JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A quantified list of SPECIFIC component types. Do not group them generically. Example: '12x MLCC Capacitors', '3x Electrolytic Capacitors', '5x 0603 Resistors'."
    },
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name or marking (e.g., 'C12', 'R5', 'U1')" },
          type: { type: Type.STRING, description: "Specific type (e.g., 'Electrolytic Capacitor', 'Ceramic Capacitor')" },
          function: { type: Type.STRING, description: "Brief note on purpose" },
          isCritical: { type: Type.BOOLEAN, description: "Is this a critical IC?" }
        },
        required: ["name", "type", "function", "isCritical"]
      },
      description: "Detailed list of components found."
    },
    pcbCategory: { type: Type.STRING, description: "Likely application or category." },
    damageAssessment: {
      type: Type.OBJECT,
      properties: {
        detected: { type: Type.BOOLEAN },
        visibleFaults: { type: Type.ARRAY, items: { type: Type.STRING } },
        conditionGrade: { 
          type: Type.STRING, 
          enum: ["A", "B", "C", "D"],
          description: "A: Excellent/Clean. B: Good/Minor Dust. C: Fair/Damage/Grime. D: Poor/Severe."
        },
        conditionDescription: { type: Type.STRING, description: "Detailed description of condition and cleanliness." }
      },
      required: ["detected", "visibleFaults", "conditionGrade", "conditionDescription"]
    },
    costAnalysis: {
      type: Type.OBJECT,
      properties: {
        componentValueRange: { type: Type.STRING, description: "Value range in INR." },
        manufacturingComplexity: { type: Type.STRING },
        conditionDepreciation: { type: Type.STRING }
      },
      required: ["componentValueRange", "manufacturingComplexity", "conditionDepreciation"]
    },
    finalValuation: {
      type: Type.OBJECT,
      properties: {
        asIsValue: { type: Type.STRING, description: "Raw Component Value in INR." }
      },
      required: ["asIsValue"]
    },
    technicalInsights: { type: Type.STRING },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["summary", "components", "pcbCategory", "damageAssessment", "costAnalysis", "finalValuation", "technicalInsights", "suggestions"]
};

const projectIdeasSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
          missingComponents: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of essential components the user did NOT list but needs to complete this project."
          }
        },
        required: ["title", "description", "difficulty", "missingComponents"]
      }
    }
  },
  required: ["projects"]
};

const SYSTEM_INSTRUCTION = `
You are "ElectroRescue.AI", a specialized Electronics Vision Analysis Agent.
Analyze the PCB image provided. Be concise and technically precise.

# OBJECTIVE
1. **COMPONENT COUNTING (CRITICAL)**: In the 'summary' output, you MUST separate components by subtype.
   - ❌ WRONG: "15x Capacitors"
   - ✅ CORRECT: "12x Ceramic Capacitors", "3x Electrolytic Capacitors", "1x Tantalum Capacitor".
   - ❌ WRONG: "Resistors"
   - ✅ CORRECT: "10x SMD Resistors", "2x Power Resistors".
   - ❌ WRONG: "Connectors"
   - ✅ CORRECT: "1x USB-C Port", "1x JST Connector".
2. **QUALITY & CLEANLINESS**: Detect environmental conditions.
   - Look for: Dust accumulation, Flux residue, Grime, Oxidation, Debris.
   - Add these to 'visibleFaults' if present (e.g., "Heavy Dust Accumulation", "Flux Residue").
3. **DAMAGE ANALYSIS**:
   - Check for burns, cracks, corrosion, bent pins, broken traces.
   - Grade A: Like new, very clean.
   - Grade B: Good, minor dust or signs of use.
   - Grade C: Visible dirt, grime, or component damage.
   - Grade D: Severe damage, heavy corrosion, burns.
4. **VALUATION (STRICT PRICING RULES IN INR)**: 
   - You are estimating the **salvage value** of visible components ONLY.
   - **General Rule**: The total 'asIsValue' must generally be **BELOW ₹200 INR**.
   - **Condition Rule**: If the Condition Grade is **B, C, or D**, the value MUST be **BELOW ₹150 INR**.
   - **High Density Exception**: ONLY if the visual component count is clearly **> 65 components**, you may estimate between **₹100 - ₹250 INR**.
   - Do NOT provide a resale value for the whole board. Only the scrap/component value.
`;

export const analyzePCBImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this PCB. Count specific component types. Check for DAMAGE. Provide conservative salvage valuation in INR < 200."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Lower temperature for faster, more deterministic results
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

const CHAT_SYSTEM_INSTRUCTION = `
You are "ResQ", the user's virtual assistance for ElectroRescue.AI.
Your goal is to be a calm, friendly, and highly knowledgeable companion for electronics enthusiasts.

**CORE BEHAVIORS:**

1.  **Warm Greeting:** ALWAYS start every response by politely acknowledging the user (e.g., "Hello!", "That's a great question.", "I'm happy to help you with that."). Be polite and welcoming.
2.  **Calm & User-Friendly Tone:** Use simple, clear language. Avoid being overly robotic. Use a calm, reassuring tone, especially if the user is asking about damaged or broken items. Use friendly emojis (🤖, ✨, 🔧) where appropriate.
3.  **Provide Extra Details:** Do not just give a one-sentence answer. Provide context, background information, or "fun facts" about the component or topic to educate the user.
4.  **Generate Ideas:** If the user asks about a specific board or component, proactively suggest what they could do with it (e.g., "You could use this microcontroller for a home automation project," or "These capacitors are great for filtering power supplies"). Inspire them to innovate.
5.  **Image Awareness:** You do NOT see the image the user uploaded in this chat window. If they ask "What is this component?", ask them to describe the markings or refer to the analysis report generated on the screen.

**TOPICS:**
- Identifying electronic components.
- Suggesting projects for salvaged parts.
- Troubleshooting repair issues.
- Soldering tips and safety.
`;

export const sendChatMessage = async (history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const generateProjectIdeas = async (componentList: string): Promise<ProjectIdea[]> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key is missing.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [{ text: `I have these components: ${componentList}. Suggest 5-10 specific DIY electronics projects.` }]
      },
      config: {
        systemInstruction: "You are a creative DIY electronics expert. Based on the user's component list, suggest 5 to 10 practical projects. Identify any ESSENTIAL missing components they would need to buy.",
        responseMimeType: "application/json",
        responseSchema: projectIdeasSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = JSON.parse(text);
    return parsed.projects || [];
  } catch (error) {
    console.error("Project generation failed:", error);
    throw error;
  }
};
