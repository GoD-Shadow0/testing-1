import type { GestureSuggestionOutput } from "@/ai/flows/gesture-suggestion";

export interface GestureMapping {
  id: string;
  gestureName: string;
  action: string;
  description?: string;
}

export type AISuggestion = GestureSuggestionOutput[0];

export const PREDEFINED_ACTIONS = [
  "Volume Up", "Volume Down", "Mute/Unmute",
  "Brightness Up", "Brightness Down",
  "Next Track", "Previous Track", "Play/Pause Media",
  "Switch Application Forward", "Switch Application Backward",
  "Open Spotlight Search", "Show Desktop", "Mission Control/Task View",
  "Scroll Up", "Scroll Down", "Zoom In", "Zoom Out",
  "Undo", "Redo", "Copy", "Paste", "Custom Action..."
] as const;

export type PredefinedAction = typeof PREDEFINED_ACTIONS[number];
