// lib/server/openai.ts

import fs from 'fs';
import path from 'path';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { LangChainParseResult } from "../../types";

// Mark this file as server-only to prevent it from being imported in client components
import 'server-only';

export function getOpenAIApiKey(): string | undefined {
  // Same implementation as before
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.openaiApiKey) {
        return config.openaiApiKey;
      }
    }
  } catch (error) {
    console.error('Error reading config file:', error);
  }

  return process.env.OPENAI_API_KEY;
}

export function saveOpenAIApiKey(apiKey: string): boolean {
  // Same implementation as before
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    let config: Record<string, any> = {};
    
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    config.openaiApiKey = apiKey;
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
}

function createLangChainClient(): ChatOpenAI {
  // Same implementation as before
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please add it in the settings.');
  }
  
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0,
  });
}

export async function parseNaturalLanguage(text: string): Promise<LangChainParseResult> {
  // Same implementation as before
  try {
    const model = createLangChainClient();
    
    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        trigger: z.string().describe("The event that starts the automation"),
        action: z.string().describe("The task to perform when triggered"),
        schedule: z.enum(["immediate", "delayed"]).describe("Whether the action should happen immediately or after a delay"),
        delay: z.number().optional().describe("If schedule is delayed, the time delay in minutes (default to 60 if not specified)")
      })
    );
    
    const formatInstructions = parser.getFormatInstructions();
    
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are a helpful assistant that parses natural language descriptions of automation rules into a structured format.
        
        ${formatInstructions}`
      ),
      HumanMessagePromptTemplate.fromTemplate("{text}")
    ]);
    
    const input = await prompt.formatMessages({
      text: text
    });
    
    const response = await model.call(input);
    
    const result = await parser.parse(response.content as string);
    
    if (result.schedule === "delayed" && !result.delay) {
      result.delay = 60;
    }
    
    return result;
  } catch (error) {
    console.error('Error calling LangChain/OpenAI:', error);
    throw new Error('Failed to parse natural language input');
  }
}