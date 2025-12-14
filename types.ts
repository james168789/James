export interface CardData {
  id: string;
  backgroundBase64: string; // The generated background image
  message: string; // The generated Thai message
  userImageBase64: string | null; // The user's uploaded image
  isGenerating: boolean;
}

export interface GenerationConfig {
  userPrompt: string;
  userImage: string; // Base64
}

export enum GenerationStep {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
