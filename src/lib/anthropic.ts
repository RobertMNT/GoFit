import Anthropic from "@anthropic-ai/sdk";

// Cliente Anthropic para uso exclusivo en servidor — clave nunca expuesta al cliente
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Modelo a usar para generación de planes
export const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
