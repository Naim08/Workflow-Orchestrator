import { getOpenAIApiKey } from './server/openai';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { LLMChain } from "langchain/chains";
import { z } from "zod";
import { LangChainParseResult, RuleCondition, Rule } from '../types';

interface ChatModelOptions {
  modelName?: string;
  temperature?: number;
}

/**
 * Creates a new LangChain ChatOpenAI instance
 * @param options - Configuration options
 * @returns A configured ChatOpenAI instance
 */
export function createChatModel(options: ChatModelOptions = {}): ChatOpenAI {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please add it in the settings.');
  }
  
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: options.modelName || "gpt-3.5-turbo",
    temperature: options.temperature !== undefined ? options.temperature : 0,
  });
}

/**
 * Creates a schema for validating rule conditions
 * @returns A Zod schema for conditions
 */
export function createConditionSchema() {
  // Define the condition schema for rule filtering
  return z.object({
    field: z.string().describe("The data field to check"),
    operator: z.enum(["equals", "not_equals", "greater_than", "less_than", "contains", "starts_with", "ends_with"])
      .describe("The comparison operator"),
    value: z.union([z.string(), z.number(), z.boolean()])
      .describe("The value to compare against"),
  });
}

/**
 * Creates a schema for rule parsing with advanced options
 * @returns A Zod schema for rule parsing
 */
export function createRuleParsingSchema() {
  const conditionSchema = createConditionSchema();
  
  return z.object({
    trigger: z.string().describe("The event that starts the automation"),
    conditions: z.array(conditionSchema).optional()
      .describe("Optional conditions that filter when the rule should run"),
    action: z.string().describe("The task to perform when triggered"),
    schedule: z.enum(["immediate", "delayed"]).describe("Whether the action should happen immediately or after a delay"),
    delay: z.number().optional().describe("If schedule is delayed, the time delay in minutes (default to 60 if not specified)"),
    description: z.string().optional().describe("A human-readable description of what this rule does"),
  });
}

/**
 * Analyzes rule text to extract advanced rules with conditions
 * @param text - The natural language description of the rule
 * @returns The parsed rule with all components
 */
export async function analyzeRuleText(text: string): Promise<LangChainParseResult> {
  // Create the model
  const model = createChatModel({ temperature: 0 });
  
  // Create the parser
  const parser = StructuredOutputParser.fromZodSchema(createRuleParsingSchema());
  const formatInstructions = parser.getFormatInstructions();
  const escapedFormatInstructions = formatInstructions.replace(/{/g, '{{').replace(/}/g, '}}');
  
  // Then use the escaped version in your template
  const systemTemplate = `You are an expert system that analyzes automation rule descriptions and extracts structured data.
    
  You need to identify:
  1. The trigger event that starts the workflow
  2. Any conditions that should filter when the rule runs (optional)
  3. The action that should be performed
  4. Whether the action is immediate or delayed
  5. If delayed, how long the delay should be (in minutes)
  
  ${escapedFormatInstructions}`;

  const humanTemplate = "Rule description: {text}";


  // Create the prompt
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(humanTemplate)
  ]);
  
  // Create and run the chain
  const chain = new LLMChain({
    llm: model,
    prompt: prompt
  });
  
  // Run the chain
  const result = await chain.call({
    text: text
  });
  
  // Parse the structured output
  const parsed = await parser.parse(result.text);
  
  // Set default values
  if (parsed.schedule === "delayed" && !parsed.delay) {
    parsed.delay = 60;
  }
  
  if (!parsed.conditions) {
    parsed.conditions = [];
  }
  
  return parsed;
}

/**
 * Generates a description of what a rule does in natural language
 * @param rule - The rule object
 * @returns A description of the rule
 */
export async function generateRuleDescription(rule: Rule): Promise<string> {
  // Create the model
  const model = createChatModel({ temperature: 0.7, modelName: "gpt-4" });
  
  // Create the system and human messages
  const systemTemplate = `You are an expert system that generates clear, concise descriptions of automation rules.
Given the components of a rule, create a human-readable description of what the rule does.`;

  const humanTemplate = `Create a concise one-sentence description of this automation rule:
- Trigger: {{trigger}}
- Action: {{action}}
- Timing: {{schedule}} {{delay}}
- Conditions: {{conditions}}`;
  
  // Create the prompt
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(humanTemplate)
  ]);
  
  // Format conditions for the template
  const conditionsText = rule.conditions && rule.conditions.length > 0 
    ? rule.conditions.map(c => `${c.field} ${c.operator} ${c.value}`).join(', ')
    : "None";
  
  // Prepare delay text
  const delayText = rule.schedule === "delayed" ? `after ${rule.delay} minutes` : "";
  
  // Create and run the chain
  const chain = new LLMChain({
    llm: model,
    prompt: prompt
  });
  
  // Run the chain
  const result = await chain.call({
    trigger: rule.triggerId.replace(/_/g, ' '),
    action: rule.actionId.replace(/_/g, ' '),
    schedule: rule.schedule,
    delay: delayText,
    conditions: conditionsText
  });
  
  return result.text.trim();
}