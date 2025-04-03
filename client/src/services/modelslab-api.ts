// ModelsLab API service for AI image generation and character creation

// Types for the ModelsLab API
export interface ModelslabGenerateRequest {
  key?: string; // This is added by the server-side proxy
  model_id: string;
  prompt: string;
  negative_prompt?: string;
  width?: string;
  height?: string;
  samples?: string;
  num_inference_steps?: string;
  safety_checker?: string;
  enhance_prompt?: string;
  seed?: number | null;
  guidance_scale?: number;
  webhook?: string | null;
  track_id?: string | null;
  tomesd?: string;
  multi_lingual?: string;
  use_karras_sigmas?: string;
  upscale?: string;
  vae?: string | null;
  lora_model?: string | null;
  lora_strength?: string | null;
  clip_skip?: string;
  scheduler?: string;
  base64?: string;
}

export interface ModelslabGenerateResponse {
  status: string;
  generationTime: number;
  id: number;
  output: string[];
  meta?: any;
}

export interface ModelslabLoraFineTuneRequest {
  key?: string; // This is added by the server-side proxy
  instance_prompt: string;
  class_prompt: string;
  base_model_type: string;
  negative_prompt?: string;
  images: string[];
  training_type: string;
  max_train_steps: string;
  lora_type: string;
  webhook?: string | null;
}

export interface ModelslabLoraFineTuneResponse {
  status: string;
  training_status: string;
  logs: string;
  model_id: string;
  id: string; // Training job ID
  message?: string; // Error message if status is error
}

export interface ModelslabFineTuneStatusResponse {
  status: string;
  state: string;
  model_id?: string;
  message?: string;
  progress?: number;
}

// API URLs - using our server as a proxy
const API_BASE_URL = '/api/modelslab';
const TEXT_TO_IMAGE_URL = `${API_BASE_URL}/generate`;
const LORA_FINETUNE_URL = `${API_BASE_URL}/lora-finetune`;
const LORA_STATUS_URL = `${API_BASE_URL}/finetune-status`;
const MODEL_LIST_URL = `${API_BASE_URL}/model-list`;

export const DEFAULT_NEGATIVE_PROMPT = "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, deformed, distorted";

/**
 * Generate images using ModelsLab's text-to-image API
 */
export async function generateImage(params: Omit<ModelslabGenerateRequest, 'key'>): Promise<ModelslabGenerateResponse> {
  try {
    const response = await fetch(TEXT_TO_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Error generating image');
    }
    
    return data;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Start a LoRA model fine-tuning process
 */
export async function startLoraFineTune(params: Omit<ModelslabLoraFineTuneRequest, 'key'>): Promise<ModelslabLoraFineTuneResponse> {
  try {
    const response = await fetch(LORA_FINETUNE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to start fine-tuning');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Error starting fine-tuning');
    }
    
    return data;
  } catch (error) {
    console.error('Error starting LoRA fine-tuning:', error);
    throw error;
  }
}

/**
 * Check the status of a LoRA fine-tuning job
 */
export async function checkFineTuneStatus(modelId: string): Promise<ModelslabFineTuneStatusResponse> {
  try {
    const response = await fetch(`${LORA_STATUS_URL}/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get fine-tune status');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Error checking fine-tune status');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking fine-tune status:', error);
    throw error;
  }
}

/**
 * Get a list of available AI models
 */
export async function getModelList(): Promise<any[]> {
  try {
    const response = await fetch(MODEL_LIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get model list');
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'Error getting model list');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting model list:', error);
    throw error;
  }
}

// Helper function to build a character prompt from design attributes
export function buildCharacterPrompt(design: any): string {
  const { style, bodyType, features = [], hairStyle, distinctiveFeatures = [], aestheticStyle, customPrompt } = design;
  
  let prompt = '';
  
  // Add base style
  if (style === 'realistic') {
    prompt += 'photorealistic portrait, highly detailed photograph, ';
  } else if (style === 'anime') {
    prompt += 'high quality anime illustration, anime style, detailed anime character, ';
  } else if (style === 'art') {
    prompt += 'high quality digital art, stylized character portrait, ';
  }
  
  // Add body type
  prompt += `${bodyType} body type, `;
  
  // Add features
  if (features.length > 0) {
    prompt += features.join(', ') + ', ';
  }
  
  // Add hair style
  if (hairStyle) {
    prompt += `${hairStyle}, `;
  }
  
  // Add distinctive features
  if (distinctiveFeatures.length > 0) {
    prompt += distinctiveFeatures.join(', ') + ', ';
  }
  
  // Add aesthetic style
  if (aestheticStyle) {
    prompt += `${aestheticStyle} aesthetic, `;
  }
  
  // Add custom prompt
  if (customPrompt) {
    prompt += customPrompt;
  }
  
  return prompt.trim();
}

// Generate training variations with different angles/poses
export async function generateTrainingVariations(
  heroImage: string,
  basePrompt: string,
  variations: string[] = []
): Promise<string[]> {
  // Default variation prompts if none provided
  const defaultVariations = [
    "front view, neutral expression",
    "profile view, looking to the side",
    "three-quarter view, slight smile",
    "close-up portrait, looking directly at camera",
    "from above, looking up",
    "looking down, thoughtful expression",
    "side view, serious expression",
    "upper body shot, arms crossed",
    "head and shoulders only, slight smile"
  ];
  
  const variationPrompts = variations.length > 0 ? variations : defaultVariations;
  const trainingImages = [heroImage]; // Start with the selected hero image
  
  try {
    // Generate variations
    for (const variation of variationPrompts) {
      const variantPrompt = `${basePrompt}, ${variation}, same person, consistent features`;
      
      const response = await generateImage({
        model_id: "flux",
        prompt: variantPrompt,
        negative_prompt: DEFAULT_NEGATIVE_PROMPT + ", inconsistent, different person",
        width: "512",
        height: "768",
        samples: "1",
        num_inference_steps: "30",
        safety_checker: "no",
        enhance_prompt: "yes"
      });
      
      if (response.output && response.output.length > 0) {
        trainingImages.push(response.output[0]);
      }
      
      // Stop if we have enough images (hero + 9 variations = 10 total)
      if (trainingImages.length >= 10) break;
    }
    
    return trainingImages;
  } catch (error) {
    console.error('Error generating training variations:', error);
    throw error;
  }
}

// Default models and presets
export const DEFAULT_MODELS = [
  { id: 'midjourney', name: 'Midjourney', type: 'general' },
  { id: 'realistic-vision-v51', name: 'Realistic Vision', type: 'realistic' },
  { id: 'tamarin-xl-v1', name: 'Tamarin XL', type: 'high-quality' },
  { id: 'flux', name: 'Flux (HD)', type: 'full-hd' },
];

export const DEFAULT_NEGATIVE_PROMPT_NSFW = "nude, genitals, breasts, nipples, sexual content, explicit, obese, overweight, deformed, cross-eye, low quality";
export const DEFAULT_NEGATIVE_PROMPT_SFW = "nude, lingerie, revealing clothes, cleavage, sexual content, explicit";

// Style presets for image generation
export const STYLE_PRESETS = [
  { id: 'none', name: 'None', prompt: '' },
  { id: 'realistic', name: 'Realistic', prompt: 'photorealistic, DSLR photography, sharp focus, high detail' },
  { id: 'anime', name: 'Anime', prompt: 'anime style, professional anime illustration, high quality anime art' },
  { id: 'digital-art', name: 'Digital Art', prompt: 'digital art, illustration, highly detailed digital painting' },
  { id: 'fantasy', name: 'Fantasy', prompt: 'fantasy art, magical, ethereal atmosphere, mystical' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'cinematic shot, movie scene, professional cinematography, dramatic lighting' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, futuristic, high tech, low life' },
  { id: 'sci-fi', name: 'Sci-Fi', prompt: 'science fiction, futuristic technology, space setting' },
  { id: 'portrait', name: 'Portrait', prompt: 'professional portrait, studio lighting, detailed facial features' },
  { id: 'nsfw', name: 'NSFW', prompt: 'erotic content, sensual pose, intimate setting, tasteful nude' }
];