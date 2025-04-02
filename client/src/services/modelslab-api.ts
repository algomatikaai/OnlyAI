// ModelsLab API service for AI image generation

// Types for the ModelsLab API
export interface ModelslabGenerateRequest {
  key: string;
  model_id: string;
  prompt: string;
  negative_prompt?: string;
  width?: string;
  height?: string;
  samples?: string;
  num_inference_steps?: string;
  safety_checker?: string;
  enhance_prompt?: string;
  enhance_style?: string;
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
  embeddings_model?: string | null;
  clip_skip?: number;
  scheduler?: string;
}

export interface ModelslabGenerateResponse {
  status: string;
  generationTime: number;
  id: number;
  output: string[];
  meta?: any;
}

export interface ModelslabLoraFineTuneRequest {
  key: string;
  instance_url: string;
  instance_name: string;
  is_base_model_sdvx: boolean;
  caption?: string;
}

export interface ModelslabLoraFineTuneResponse {
  status: string;
  message: string;
  id: string;
}

export interface ModelslabFineTuneStatusResponse {
  status: string;
  state: string;
  model_id?: string;
  message?: string;
}

// API URLs
const API_BASE_URL = 'https://modelslab.com/api/v6';
const TEXT_TO_IMAGE_URL = `${API_BASE_URL}/images/text2img`;
const LORA_FINETUNE_URL = `${API_BASE_URL}/lora/finetune`;
const LORA_STATUS_URL = `${API_BASE_URL}/lora/fine_tune_status`;

/**
 * Generate images using ModelsLab's text-to-image API
 */
export async function generateImage(params: Omit<ModelslabGenerateRequest, 'key'>): Promise<ModelslabGenerateResponse> {
  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_MODELSLAB_API_KEY;
    if (!apiKey) {
      throw new Error('ModelsLab API key not found');
    }

    const response = await fetch(TEXT_TO_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey,
        ...params
      })
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
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_MODELSLAB_API_KEY;
    if (!apiKey) {
      throw new Error('ModelsLab API key not found');
    }

    const response = await fetch(LORA_FINETUNE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey,
        ...params
      })
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
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_MODELSLAB_API_KEY;
    if (!apiKey) {
      throw new Error('ModelsLab API key not found');
    }

    const response = await fetch(`${LORA_STATUS_URL}/${modelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey
      })
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

// Default models and presets
export const DEFAULT_MODELS = [
  { id: 'midjourney', name: 'Midjourney', type: 'general' },
  { id: 'realistic-vision-v51', name: 'Realistic Vision', type: 'realistic' },
  { id: 'tamarin-xl-v1', name: 'Tamarin XL', type: 'high-quality' },
  { id: 'flux', name: 'Flux (HD)', type: 'full-hd' },
];

export const STYLE_PRESETS = [
  { id: 'realistic', name: 'Realistic', prompt: 'photorealistic, detailed, high definition, 8k' },
  { id: 'anime', name: 'Anime', prompt: 'anime style, vibrant, detailed, studio ghibli' },
  { id: 'fantasy', name: 'Fantasy', prompt: 'fantasy art, magical, detailed, mystical' },
  { id: 'painting', name: 'Painting', prompt: 'oil painting, detailed brushwork, artistic' },
  { id: 'nsfw', name: 'NSFW', prompt: 'nsfw, erotic, detailed, sensual' },
];

export const DEFAULT_NEGATIVE_PROMPT = 'blurry, bad anatomy, bad hands, cropped, worst quality, low quality, text, watermark, logo, signature, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra arms, missing arms, extra legs, missing legs, fused fingers, too many fingers';