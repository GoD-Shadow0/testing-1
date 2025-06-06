'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting gesture mappings to new users.
 *
 * The flow takes no input and returns a set of suggested gesture mappings.
 * This allows new users to quickly get started with the application.
 *
 * @interface GestureSuggestionOutput - The output type for the gesture suggestion flow.
 * @function suggestGestureMappings - The main function to trigger the gesture suggestion flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GestureSuggestionOutputSchema = z.array(
  z.object({
    gesture: z.string().describe('The name of the gesture.'),
    action: z.string().describe('The action associated with the gesture.'),
    description: z.string().describe('A description of what the gesture does.')
  })
).describe('A list of suggested gesture mappings for new users.');

export type GestureSuggestionOutput = z.infer<typeof GestureSuggestionOutputSchema>;

export async function suggestGestureMappings(): Promise<GestureSuggestionOutput> {
  return gestureSuggestionFlow();
}

const prompt = ai.definePrompt({
  name: 'gestureSuggestionPrompt',
  output: {schema: GestureSuggestionOutputSchema},
  prompt: `You are an AI assistant that suggests useful gesture mappings for a new user of a gesture-based application.

  Generate a list of 5 common and useful gesture mappings, including the gesture name, the action it performs, and a brief description of what the gesture does.

  Each mapping should be distinct and practical for common computer tasks like volume control, screen brightness, window switching, etc.

  The response must be a valid JSON array conforming to the specified schema.
  `,
});

const gestureSuggestionFlow = ai.defineFlow(
  {
    name: 'gestureSuggestionFlow',
    outputSchema: GestureSuggestionOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
