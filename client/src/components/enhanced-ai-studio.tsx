import { useState, useEffect, useRef } from 'react';
import { 
  generateImage, 
  startLoraFineTune, 
  checkFineTuneStatus, 
  buildCharacterPrompt,
  generateTrainingVariations,
  DEFAULT_MODELS, 
  STYLE_PRESETS, 
  DEFAULT_NEGATIVE_PROMPT 
} from '@/services/modelslab-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Character creation components
import CharacterDesigner, { CharacterDesign } from './character-designer';
import ConceptSelector from './concept-selector';
import CharacterTraining from './character-training';

interface AIStudioProps {
  open: boolean;
  onClose: () => void;
}

// Character Creation Templates
const CHARACTER_TEMPLATES = [
  { 
    id: 'anime-girl', 
    name: 'Anime Girl', 
    description: 'A stylized anime female character with vibrant colors and expressive features.',
    example: 'anime girl, young adult, long colorful hair, large expressive eyes, school uniform, cheerful expression, highly detailed, vibrant colors, studio ghibli inspired'
  },
  { 
    id: 'cyberpunk-character', 
    name: 'Cyberpunk Character', 
    description: 'A futuristic character with cybernetic enhancements in a neon-lit world.',
    example: 'cyberpunk character, neon lights, cybernetic implants, futuristic clothing, standing in rain-slicked streets, holographic displays, highly detailed, sci-fi, blade runner style'
  },
  { 
    id: 'fantasy-warrior', 
    name: 'Fantasy Warrior', 
    description: 'A powerful warrior character in a high fantasy setting with detailed armor and weapons.',
    example: 'fantasy warrior, ornate armor, intricate weapon design, dramatic lighting, powerful stance, detailed environment, high definition, epic fantasy style'
  },
  { 
    id: 'realistic-portrait', 
    name: 'Realistic Portrait', 
    description: 'A photorealistic human character with natural features and lighting.',
    example: 'photorealistic portrait, natural lighting, detailed skin texture, professional photography, expressive face, cinematic composition, highly detailed'
  }
];

// Prompt attribute categories
const PROMPT_ATTRIBUTES = {
  bodyType: [
    'slim', 'athletic', 'curvy', 'muscular', 'petite', 'tall', 'short'
  ],
  face: [
    'round face', 'square jaw', 'high cheekbones', 'freckles', 'full lips', 'sharp features', 'soft features'
  ],
  hair: [
    'long hair', 'short hair', 'curly hair', 'straight hair', 'pixie cut', 'braid', 'ponytail',
    'black hair', 'blonde hair', 'red hair', 'pink hair', 'blue hair', 'green hair', 'white hair'
  ],
  eyes: [
    'blue eyes', 'green eyes', 'brown eyes', 'hazel eyes', 'grey eyes', 'purple eyes', 'heterochromia',
    'large eyes', 'narrow eyes', 'cat eyes', 'almond eyes'
  ],
  clothing: [
    'casual clothing', 'formal attire', 'fantasy outfit', 'sci-fi costume', 'revealing outfit', 
    'elegant dress', 'armor', 'uniform', 'swimwear', 'lingerie', 'cyberpunk outfit'
  ],
  expression: [
    'smiling', 'serious', 'confident', 'shy', 'flirty', 'mysterious', 'surprised', 'laughing'
  ]
};

// Represents a character in the gallery
interface Character {
  id: string;
  name: string;
  previewImage: string;
  description: string;
  trainingStatus?: 'not_started' | 'in_progress' | 'complete' | 'failed';
  creationDate: Date;
  modelId?: string;
  trainingProgress?: number;
}

export default function EnhancedAIStudio({ open, onClose }: AIStudioProps) {
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('text2img');
  const [showSimpleMode, setShowSimpleMode] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Form state - Text to Image
  const [generationMode, setGenerationMode] = useState<'standard' | 'character'>('standard');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0].id);
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [guidance, setGuidance] = useState(7);
  const [steps, setSteps] = useState(30);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [samples, setSamples] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [seed, setSeed] = useState<number | null>(null);
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<{[key: string]: string[]}>({
    bodyType: [],
    face: [],
    hair: [],
    eyes: [],
    clothing: [],
    expression: []
  });

  // Character Creation
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  // Character creation workflow state
  const [characterCreationStep, setCharacterCreationStep] = useState<'design' | 'selection' | 'training' | 'complete'>('design');
  const [characterDesign, setCharacterDesign] = useState<CharacterDesign>({
    style: 'realistic',
    bodyType: 'average',
    features: [],
    hairStyle: 'long-black',
    distinctiveFeatures: [],
    aestheticStyle: 'casual',
    customPrompt: ''
  });
  const [characterConcepts, setCharacterConcepts] = useState<string[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [createCharacterProgress, setCreateCharacterProgress] = useState(0);
  const [createdCharacterId, setCreatedCharacterId] = useState<string | null>(null);
  
  // LoRA Fine-tuning state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [trainingName, setTrainingName] = useState('');
  const [trainingDescription, setTrainingDescription] = useState('');
  const [isBaseModelSDVX, setIsBaseModelSDVX] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingId, setTrainingId] = useState('');
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed' | 'failed'>('idle');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Character Gallery state
  const [characters, setCharacters] = useState<Character[]>([
    // Sample characters for demonstration
    {
      id: '1',
      name: 'Cyber Aiko',
      previewImage: 'https://replicate.delivery/pbxt/4EbhkAJ9Qp5PqCbH5mOMpVVxNgNuX8UbEJFhDvzn7EwTfFfQA/out-0.png',
      description: 'Cyberpunk anime character with neon-pink hair and futuristic outfit',
      trainingStatus: 'complete',
      creationDate: new Date('2023-12-15'),
      modelId: 'custom-lora-12345'
    },
    {
      id: '2',
      name: 'Fantasy Warrior Elf',
      previewImage: 'https://replicate.delivery/pbxt/AntibodyServicesEwt6Hs0DOKnBYrxd5JLfTZNwhK1XVZwVuJ0E/out-0.png',
      description: 'Elven warrior with ornate armor and mystical weapons',
      trainingStatus: 'in_progress',
      trainingProgress: 65,
      creationDate: new Date('2023-12-20')
    }
  ]);
  
  // Results
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [allGeneratedImages, setAllGeneratedImages] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [showResultViewer, setShowResultViewer] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<{prompt: string, images: string[]}[]>([]);

  // Apply style preset to prompt
  useEffect(() => {
    if (selectedStyle && selectedStyle !== 'none') {
      const style = STYLE_PRESETS.find(s => s.id === selectedStyle);
      if (style && !prompt.includes(style.prompt)) {
        setPrompt((prev) => {
          if (prev) {
            return `${prev}, ${style.prompt}`;
          } else {
            return style.prompt;
          }
        });
      }
    }
  }, [selectedStyle]);

  // Apply character template
  useEffect(() => {
    if (selectedTemplate) {
      const template = CHARACTER_TEMPLATES.find(t => t.id === selectedTemplate);
      if (template) {
        setPrompt(template.example);
      }
    }
  }, [selectedTemplate]);

  // Generate random seed when useRandomSeed is true
  useEffect(() => {
    if (useRandomSeed) {
      setSeed(Math.floor(Math.random() * 2147483647));
    }
  }, [useRandomSeed]);

  // Update prompt when attributes are selected
  useEffect(() => {
    if (generationMode === 'character') {
      const attributesText = Object.values(selectedAttributes)
        .flatMap(attributes => attributes)
        .join(', ');
      
      if (attributesText) {
        const basePrompt = characterDescription || 'character portrait';
        setPrompt(`${basePrompt}, ${attributesText}`);
      }
    }
  }, [selectedAttributes, characterDescription, generationMode]);

  // Monitor training progress
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  const startTrainingMonitor = (id: string) => {
    // Clear any existing interval
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    // Set up monitoring of training progress
    statusCheckInterval.current = setInterval(async () => {
      try {
        const status = await checkFineTuneStatus(id);
        
        if (status.state === 'running') {
          // Update progress based on some estimation logic
          // This is an approximation since the API might not provide exact progress
          setTrainingProgress(prevProgress => {
            const newProgress = Math.min(prevProgress + 1, 99); // Cap at 99% until complete
            return newProgress;
          });
          
          // Estimate remaining time (very rough approximation)
          setEstimatedTimeRemaining(prevTime => {
            return Math.max(prevTime - 30, 0); // Reduce by 30 seconds each check
          });
        } else if (status.state === 'succeeded' && status.model_id) {
          setTrainingStatus('completed');
          setTrainingProgress(100);
          setEstimatedTimeRemaining(0);
          
          // Add the trained model to the character gallery
          const newCharacter: Character = {
            id: Date.now().toString(),
            name: trainingName,
            description: trainingDescription,
            previewImage: selectedImages[0], // Use the first training image as preview
            trainingStatus: 'complete',
            creationDate: new Date(),
            modelId: status.model_id
          };
          
          setCharacters(prev => [...prev, newCharacter]);
          
          toast({
            title: "Training Complete",
            description: `Your character "${trainingName}" has been successfully trained!`,
          });
          
          clearInterval(statusCheckInterval.current!);
          statusCheckInterval.current = null;
        } else if (status.state === 'failed') {
          setTrainingStatus('failed');
          toast({
            title: "Training Failed",
            description: status.message || "The model training process failed. Please try again.",
            variant: "destructive"
          });
          
          clearInterval(statusCheckInterval.current!);
          statusCheckInterval.current = null;
        }
      } catch (error) {
        console.error('Error checking training status:', error);
      }
    }, 5000); // Check every 5 seconds
  };

  const toggleAttribute = (category: string, attribute: string) => {
    setSelectedAttributes(prev => {
      const updatedAttributes = { ...prev };
      
      if (updatedAttributes[category].includes(attribute)) {
        // Remove the attribute if already selected
        updatedAttributes[category] = updatedAttributes[category].filter(a => a !== attribute);
      } else {
        // Add the attribute
        updatedAttributes[category] = [...updatedAttributes[category], attribute];
      }
      
      return updatedAttributes;
    });
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a basic prompt to enhance.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate AI-based prompt enhancement
    const enhancementPhrases = [
      "highly detailed", "professional lighting", "4k resolution", "sharp focus",
      "vibrant colors", "photorealistic", "cinematic composition", "award winning",
      "trending on artstation", "unreal engine rendering", "octane render", "ray tracing"
    ];
    
    // Add 2-4 random enhancement phrases that aren't already in the prompt
    const availablePhrases = enhancementPhrases.filter(phrase => !prompt.includes(phrase));
    const numberOfPhrases = Math.floor(Math.random() * 3) + 2; // 2 to 4 phrases
    const selectedPhrases = [];
    
    for (let i = 0; i < numberOfPhrases && i < availablePhrases.length; i++) {
      const randomIndex = Math.floor(Math.random() * availablePhrases.length);
      selectedPhrases.push(availablePhrases[randomIndex]);
      availablePhrases.splice(randomIndex, 1);
    }
    
    const enhancedPrompt = `${prompt}, ${selectedPhrases.join(', ')}`;
    setPrompt(enhancedPrompt);
    
    toast({
      title: "Prompt Enhanced",
      description: "Your prompt has been enhanced with quality details."
    });
  };

  const handleGenerateVariations = () => {
    if (!selectedResult) {
      toast({
        title: "No Image Selected",
        description: "Please generate and select an image first to create variations.",
        variant: "destructive"
      });
      return;
    }
    
    // Set samples to 4 for generating variations
    setSamples(4);
    // Disable random seed to maintain some consistency with the original
    setUseRandomSeed(false);
    // Slight variation in the seed for each new image
    setSeed((seed || 1000) + 1);
    
    // Generate with the same prompt
    handleGenerate();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive"
      });
      return;
    }

    try {
      setGenerating(true);
      setResults([]);

      const response = await generateImage({
        model_id: selectedModel,
        prompt: prompt,
        negative_prompt: negativePrompt,
        width: width.toString(),
        height: height.toString(),
        samples: samples.toString(),
        num_inference_steps: steps.toString(),
        guidance_scale: guidance,
        enhance_prompt: enhancePrompt ? "yes" : "no",
        seed: useRandomSeed ? Math.floor(Math.random() * 2147483647) : seed,
      });

      if (response.output && response.output.length > 0) {
        setResults(response.output);
        setSelectedResult(response.output[0]);
        
        // Add to history
        setGenerationHistory(prev => [...prev, {
          prompt: prompt,
          images: response.output
        }]);
        
        // Add to all generated images for training
        setAllGeneratedImages(prev => [...prev, ...response.output]);
      } else {
        toast({
          title: "Generation Failed",
          description: "No images were generated. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleStartTraining = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image for training.",
        variant: "destructive"
      });
      return;
    }
    
    if (!trainingName) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your character.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsTraining(true);
      setTrainingStatus('training');
      setTrainingProgress(0);
      setEstimatedTimeRemaining(1800); // 30 minutes initial estimate
      
      // In a real implementation, you would upload images to a server first,
      // then provide URLs to the ModelsLab API
      const imageUrl = selectedImages[0]; // Using first image for demo
      
      const response = await startLoraFineTune({
        instance_prompt: trainingName,
        class_prompt: "person, character",
        base_model_type: isBaseModelSDVX ? "sdxl" : "sd15",
        images: selectedImages,
        training_type: "lora",
        max_train_steps: "800",
        lora_type: "standard"
      });
      
      if (response.status === 'success' && response.id) {
        setTrainingId(response.id);
        
        toast({
          title: "Training Started",
          description: "Your character model training has started. This process may take 30-45 minutes."
        });
        
        // Start monitoring the training progress
        startTrainingMonitor(response.id);
      } else {
        throw new Error(response.message || "Failed to start training");
      }
    } catch (error) {
      console.error('Error starting training:', error);
      setTrainingStatus('failed');
      
      toast({
        title: "Training Error",
        description: error instanceof Error ? error.message : "Failed to start training. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const handleSaveImage = (imageUrl: string) => {
    // Create anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `onlyai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image Saved",
      description: "The image has been saved to your downloads folder.",
    });
  };

  const handleUseImage = (imageUrl: string) => {
    // Save as content to database or close and return the URL
    // This will be implemented when the content creation flow is ready
    onClose();
    toast({
      title: "Image Selected",
      description: "The generated image has been selected for your content.",
    });
  };

  const handleViewImage = (imageUrl: string) => {
    setSelectedResult(imageUrl);
    setShowResultViewer(true);
  };
  
  const handleSetAsCharacter = (imageUrl: string) => {
    // Create a new character from the generated image
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: characterName || `Character ${characters.length + 1}`,
      description: characterDescription || prompt,
      previewImage: imageUrl,
      trainingStatus: 'not_started',
      creationDate: new Date()
    };
    
    setCharacters(prev => [...prev, newCharacter]);
    setSelectedCharacter(newCharacter);
    
    toast({
      title: "Character Created",
      description: "This image has been saved as a character. You can now train a custom model using this character.",
    });
  };
  
  const handleSelectForTraining = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(prev => prev.filter(img => img !== imageUrl));
    } else {
      setSelectedImages(prev => [...prev, imageUrl]);
    }
  };
  
  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    
    // If the character has a description, use it as the base for the prompt
    if (character.description) {
      setCharacterDescription(character.description);
      setPrompt(character.description);
    }
    
    // If the character has a name, use it
    if (character.name) {
      setCharacterName(character.name);
    }
    
    toast({
      title: "Character Selected",
      description: `You're now working with "${character.name}".`
    });
  };
  
  const handleGenerateWithCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setPrompt(`${character.name}, ${character.description}`);
    setActiveTab('text2img');
    handleGenerate();
  };
  
  // Character Creation Workflow Functions
  const handleCharacterDesignSubmit = async () => {
    try {
      setGenerating(true);
      
      // Build prompt from character design
      const designPrompt = buildCharacterPrompt(characterDesign);
      const fullPrompt = characterName 
        ? `${characterName}, ${designPrompt}` 
        : designPrompt;
      
      // Generate 4 character concepts
      const response = await generateImage({
        model_id: "flux", // Using high-quality model for character concepts
        prompt: fullPrompt,
        negative_prompt: DEFAULT_NEGATIVE_PROMPT,
        width: "512",
        height: "768",
        samples: "4",
        num_inference_steps: "30",
        guidance_scale: 7.5,
        enhance_prompt: "yes"
      });
      
      if (response.output && response.output.length > 0) {
        setCharacterConcepts(response.output);
        setCharacterCreationStep('selection');
      } else {
        throw new Error("No images were generated");
      }
    } catch (error) {
      console.error('Error generating character concepts:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate character concepts.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleSelectConcept = (imageUrl: string) => {
    setSelectedConcept(imageUrl);
  };
  
  const handleRegenerateConcepts = () => {
    handleCharacterDesignSubmit();
  };
  
  const handleStartCharacterTraining = async () => {
    if (!selectedConcept) {
      toast({
        title: "No Concept Selected",
        description: "Please select a character concept first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!characterName) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your character.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCharacterCreationStep('training');
      setCreateCharacterProgress(5);
      
      // Generate training variations based on the selected concept
      toast({
        title: "Generating Training Images",
        description: "Creating multiple views of your character for consistent results...",
      });
      
      // Use the character design to build the base prompt
      const basePrompt = buildCharacterPrompt(characterDesign);
      
      // Generate 9 variations of the selected concept
      const trainingImages = await generateTrainingVariations(
        selectedConcept, 
        `${characterName}, ${basePrompt}`
      );
      
      if (trainingImages.length < 3) {
        throw new Error("Not enough training images could be generated");
      }
      
      setCreateCharacterProgress(30);
      
      // Start training the model
      toast({
        title: "Starting Training",
        description: "Beginning the model training process...",
      });
      
      const response = await startLoraFineTune({
        instance_prompt: characterName,
        class_prompt: "person, character",
        base_model_type: "sdxl", // High quality model
        images: trainingImages,
        training_type: "lora",
        max_train_steps: "800",
        lora_type: "standard"
      });
      
      if (response.status === 'success' && response.id) {
        setTrainingId(response.id);
        setCreateCharacterProgress(40);
        
        // Start monitoring training progress
        startCharacterTrainingMonitor(response.id);
      } else {
        throw new Error(response.message || "Failed to start character training");
      }
    } catch (error) {
      console.error('Error in character training process:', error);
      setCharacterCreationStep('design');
      
      toast({
        title: "Training Error",
        description: error instanceof Error ? error.message : "Failed to start character training.",
        variant: "destructive"
      });
    }
  };
  
  const startCharacterTrainingMonitor = (id: string) => {
    // Clear any existing interval
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
    
    // Set up monitoring of training progress
    statusCheckInterval.current = setInterval(async () => {
      try {
        const status = await checkFineTuneStatus(id);
        
        if (status.state === 'running') {
          // Update progress based on some estimation logic
          setCreateCharacterProgress(prev => {
            const newProgress = Math.min(prev + 1, 95); // Cap at 95% until complete
            return newProgress;
          });
        } else if (status.state === 'succeeded' && status.model_id) {
          setCreateCharacterProgress(100);
          
          // Add the trained model to the character gallery
          const newCharacter: Character = {
            id: Date.now().toString(),
            name: characterName,
            description: buildCharacterPrompt(characterDesign),
            previewImage: selectedConcept as string,
            trainingStatus: 'complete',
            creationDate: new Date(),
            modelId: status.model_id
          };
          
          setCharacters(prev => [...prev, newCharacter]);
          setCreatedCharacterId(newCharacter.id);
          
          // Set step to complete
          setCharacterCreationStep('complete');
          
          toast({
            title: "Character Created",
            description: `Your character "${characterName}" has been successfully created!`,
          });
          
          clearInterval(statusCheckInterval.current!);
          statusCheckInterval.current = null;
        } else if (status.state === 'failed') {
          setCharacterCreationStep('design');
          
          toast({
            title: "Training Failed",
            description: status.message || "The character training process failed. Please try again.",
            variant: "destructive"
          });
          
          clearInterval(statusCheckInterval.current!);
          statusCheckInterval.current = null;
        }
      } catch (error) {
        console.error('Error checking character training status:', error);
      }
    }, 5000); // Check every 5 seconds
  };
  
  const handleFinishCharacterCreation = () => {
    // Reset the character creation workflow
    setCharacterCreationStep('design');
    setSelectedConcept(null);
    setCreateCharacterProgress(0);
    
    // If we have a created character, select it
    if (createdCharacterId) {
      const character = characters.find(c => c.id === createdCharacterId);
      if (character) {
        setSelectedCharacter(character);
      }
      setCreatedCharacterId(null);
    }
    
    // Switch to gallery tab to show all characters
    setActiveTab('gallery');
  };
  
  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };
  
  const nextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">AI Studio</DialogTitle>
            <DialogDescription>Create and fine-tune AI-generated characters</DialogDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={startTutorial}
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Creator? Start Here</span>
            </Button>
            <div className="flex items-center space-x-2 border rounded-full px-3 py-1">
              <Label htmlFor="simple-mode" className="text-xs">
                {showSimpleMode ? 'Simple Mode' : 'Advanced Mode'}
              </Label>
              <Switch 
                id="simple-mode" 
                checked={!showSimpleMode} 
                onCheckedChange={(checked) => setShowSimpleMode(!checked)} 
              />
            </div>
          </div>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mt-2 flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full">
            <TabsTrigger value="text2img" className="flex-1">Text to Image</TabsTrigger>
            <TabsTrigger value="character-creation" className="flex-1">Character Creation</TabsTrigger>
            <TabsTrigger value="lora" className="flex-1">LoRA Fine-tuning</TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1">Character Gallery</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
          </TabsList>
          
          {/* TEXT TO IMAGE TAB */}
          <TabsContent value="text2img" className="flex-1 flex flex-col mt-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <RadioGroup 
                defaultValue="standard" 
                value={generationMode}
                onValueChange={(value) => setGenerationMode(value as 'standard' | 'character')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard-mode" />
                  <Label htmlFor="standard-mode">Standard Generation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="character" id="character-mode" />
                  <Label htmlFor="character-mode">Character Creation</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-auto">
              {/* Left Panel: Generation Controls */}
              <div className="flex flex-col space-y-4 overflow-auto pr-2">
                {/* Character Creation Mode - Only show when character mode is selected */}
                {generationMode === 'character' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <WandIcon className="h-5 w-5 mr-2" />
                        Character Builder
                      </CardTitle>
                      <CardDescription>Create your own AI character</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Character Name and Description */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="character-name">Character Name</Label>
                          <Input
                            id="character-name"
                            placeholder="Give your character a name"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="character-description">Base Description</Label>
                          <Textarea
                            id="character-description"
                            placeholder="Describe your character's basic appearance"
                            value={characterDescription}
                            onChange={(e) => setCharacterDescription(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>
                      </div>
                      
                      {/* Character Templates */}
                      <div className="space-y-2">
                        <Label htmlFor="character-template">Start with a Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {CHARACTER_TEMPLATES.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Character Attributes */}
                      <div className="space-y-3">
                        <Label>Customize Attributes</Label>
                        
                        <Accordion type="multiple" className="w-full">
                          {Object.entries(PROMPT_ATTRIBUTES).map(([category, attributes]) => (
                            <AccordionItem key={category} value={category}>
                              <AccordionTrigger className="capitalize">
                                {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-wrap gap-2 py-2">
                                  {attributes.map((attribute) => {
                                    const isSelected = selectedAttributes[category]?.includes(attribute);
                                    return (
                                      <Badge 
                                        key={attribute} 
                                        variant={isSelected ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleAttribute(category, attribute)}
                                      >
                                        {attribute}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                      
                      {/* Selected Character Preview - Show only when a character is selected */}
                      {selectedCharacter && (
                        <div className="border rounded-md p-3 flex items-center space-x-3">
                          <img 
                            src={selectedCharacter.previewImage} 
                            alt={selectedCharacter.name}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{selectedCharacter.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedCharacter.description}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedCharacter(null)}
                          >
                            <RefreshIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Prompt Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Prompt</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleEnhancePrompt}
                            >
                              <WandIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enhance your prompt with magic</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder={`Describe what you want to generate...${generationMode === 'character' ? '\nYour character attributes will be added automatically' : ''}`}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
                
                {/* Model & Style */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Model & Style</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="style">Style Preset</Label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {STYLE_PRESETS.map((style) => (
                            <SelectItem key={style.id} value={style.id}>{style.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                {!showSimpleMode && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Advanced Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Image Settings</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Width: {width}px</Label>
                              </div>
                              <Slider 
                                value={[width]} 
                                min={256} 
                                max={1024} 
                                step={64} 
                                onValueChange={(value) => setWidth(value[0])} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Height: {height}px</Label>
                              </div>
                              <Slider 
                                value={[height]} 
                                min={256} 
                                max={1024} 
                                step={64} 
                                onValueChange={(value) => setHeight(value[0])} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Number of images: {samples}</Label>
                              </div>
                              <Slider 
                                value={[samples]} 
                                min={1} 
                                max={4} 
                                step={1} 
                                onValueChange={(value) => setSamples(value[0])} 
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Generation Parameters</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Guidance Scale: {guidance}</Label>
                              </div>
                              <Slider 
                                value={[guidance]} 
                                min={1} 
                                max={20} 
                                step={0.5} 
                                onValueChange={(value) => setGuidance(value[0])} 
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label>Steps: {steps}</Label>
                              </div>
                              <Slider 
                                value={[steps]} 
                                min={10} 
                                max={100} 
                                step={1} 
                                onValueChange={(value) => setSteps(value[0])} 
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="enhance-prompt" 
                                checked={enhancePrompt} 
                                onCheckedChange={setEnhancePrompt} 
                              />
                              <Label htmlFor="enhance-prompt">Enhance Prompt</Label>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-3">
                          <AccordionTrigger>Seed Control</AccordionTrigger>
                          <AccordionContent className="space-y-4 pt-2">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="random-seed" 
                                checked={useRandomSeed} 
                                onCheckedChange={setUseRandomSeed} 
                              />
                              <Label htmlFor="random-seed">Use Random Seed</Label>
                            </div>
                            {!useRandomSeed && (
                              <div className="space-y-2">
                                <Label htmlFor="seed">Seed Value</Label>
                                <Input 
                                  id="seed" 
                                  type="number" 
                                  value={seed?.toString() || ''} 
                                  onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : null)} 
                                  placeholder="Enter seed (0-2147483647)" 
                                />
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="item-4">
                          <AccordionTrigger>Negative Prompt</AccordionTrigger>
                          <AccordionContent className="pt-2">
                            <Textarea 
                              placeholder="Enter what you don't want in the image..."
                              value={negativePrompt}
                              onChange={(e) => setNegativePrompt(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setNegativePrompt(DEFAULT_NEGATIVE_PROMPT)}
                            >
                              Reset to Default
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right Panel: Results */}
              <div className="flex flex-col space-y-4 overflow-auto">
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Results</CardTitle>
                      {generationMode === 'character' && results.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleGenerateVariations}
                          className="flex items-center"
                        >
                          <RefreshIcon className="h-4 w-4 mr-1" />
                          Generate Variations
                        </Button>
                      )}
                    </div>
                    <CardDescription>Generated images will appear here.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col overflow-auto">
                    {generating ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <SpinnerIcon className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Generating your images...</p>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {results.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={imageUrl} 
                              alt={`Generated image ${index + 1}`} 
                              className="rounded-md w-full h-auto object-cover aspect-square cursor-pointer"
                              onClick={() => handleViewImage(imageUrl)}
                            />
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <div className="absolute inset-0 flex items-center justify-center gap-2">
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveImage(imageUrl);
                                  }}
                                >
                                  <DownloadIcon className="h-4 w-4" />
                                </Button>
                                
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUseImage(imageUrl);
                                  }}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </Button>
                                
                                {generationMode === 'character' && (
                                  <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetAsCharacter(imageUrl);
                                    }}
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {generationMode === 'character' && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetAsCharacter(imageUrl);
                                    }}
                                  >
                                    Select as Character
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <div className="bg-muted/50 rounded-full p-3">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {generationMode === 'character' 
                              ? 'Create your character by using the builder on the left' 
                              : 'Enter a prompt and click generate to create an image'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full" 
                      disabled={!prompt.trim() || generating}
                      onClick={handleGenerate}
                    >
                      {generating ? (
                        <>
                          <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* CHARACTER CREATION TAB */}
          <TabsContent value="character-creation" className="flex-1 flex flex-col mt-4 overflow-auto">
            <div className="flex-1 flex flex-col">
              {characterCreationStep === 'design' && (
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-medium mb-6">Design Your Character</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="cc-character-name">Character Name</Label>
                        <Input
                          id="cc-character-name"
                          placeholder="Give your character a name"
                          value={characterName}
                          onChange={(e) => setCharacterName(e.target.value)}
                        />
                      </div>
                      
                      <CharacterDesigner 
                        design={characterDesign}
                        onChange={setCharacterDesign}
                        onGenerate={handleCharacterDesignSubmit}
                      />
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed">
                      <div className="text-center space-y-4">
                        <h4 className="text-lg font-medium">Character Preview</h4>
                        <p className="text-sm text-muted-foreground">
                          Fill out the form and generate concepts to see a preview of your character.
                        </p>
                        <div className="py-8">
                          <WandIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                        </div>
                        <Button 
                          onClick={handleCharacterDesignSubmit} 
                          className="mt-4"
                          disabled={!characterName || generating}
                        >
                          {generating ? (
                            <>
                              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            'Generate Character Concepts'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {characterCreationStep === 'selection' && (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium">Select Your Character Concept</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCharacterCreationStep('design')}
                    >
                      Back to Design
                    </Button>
                  </div>
                  
                  <ConceptSelector 
                    concepts={characterConcepts}
                    onSelect={handleSelectConcept}
                    onRegenerate={handleRegenerateConcepts}
                  />
                  
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={handleStartCharacterTraining} 
                      disabled={!selectedConcept}
                      className="px-8"
                    >
                      Continue to Training
                    </Button>
                  </div>
                </div>
              )}
              
              {characterCreationStep === 'training' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <CharacterTraining 
                    progress={createCharacterProgress}
                    characterName={characterName}
                    estimatedTimeRemaining={1800 - Math.floor(createCharacterProgress * 18)}
                    status="training"
                  />
                </div>
              )}
              
              {characterCreationStep === 'complete' && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <CharacterTraining 
                    progress={100}
                    characterName={characterName}
                    status="completed"
                  />
                  
                  <div className="mt-6">
                    <Button 
                      onClick={handleFinishCharacterCreation}
                      className="px-8"
                    >
                      View Your New Character
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* LORA FINE-TUNING TAB */}
          <TabsContent value="lora" className="flex-1 flex flex-col mt-4 overflow-auto">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>LoRA Fine-tuning</CardTitle>
                <CardDescription>
                  Train a custom AI model of your character for more consistent results
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {trainingStatus === 'training' ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-8 py-10">
                    <div className="w-full max-w-md space-y-4">
                      <h3 className="text-lg font-medium text-center">Training in Progress</h3>
                      <Progress value={trainingProgress} className="h-2 w-full" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress: {trainingProgress}%</span>
                        {estimatedTimeRemaining > 0 && (
                          <span>
                            Estimated time: {Math.floor(estimatedTimeRemaining / 60)}m {estimatedTimeRemaining % 60}s
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-8 border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 border-b">
                          <h4 className="font-medium">Training "{trainingName}"</h4>
                        </div>
                        <div className="p-4 space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Your custom model is being trained. This can take 30-45 minutes.
                            You can close this dialog and come back later.
                          </p>
                          <div className="flex justify-between items-center text-sm">
                            <span>Training ID: {trainingId}</span>
                            <Badge variant="outline">In Progress</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Step 1: Select Training Images</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Choose images to train your custom character model. Select 4-10 images for best results.
                          </p>
                          
                          <div className="border rounded-md p-4">
                            <ScrollArea className="h-[300px] w-full pr-4">
                              <div className="grid grid-cols-3 gap-3">
                                {allGeneratedImages.length > 0 ? (
                                  allGeneratedImages.map((imageUrl, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`
                                        relative border rounded-md overflow-hidden cursor-pointer
                                        ${selectedImages.includes(imageUrl) ? 'ring-2 ring-primary' : ''}
                                      `}
                                      onClick={() => handleSelectForTraining(imageUrl)}
                                    >
                                      <img 
                                        src={imageUrl} 
                                        alt={`Generated image ${idx}`} 
                                        className="w-full h-auto aspect-square object-cover"
                                      />
                                      {selectedImages.includes(imageUrl) && (
                                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                          <CheckIcon className="h-3 w-3" />
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="col-span-3 flex flex-col items-center justify-center text-center h-40">
                                    <p className="text-sm text-muted-foreground">
                                      No images available. Generate some images in the Text to Image tab first.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                            
                            <div className="mt-4 text-sm text-muted-foreground">
                              {selectedImages.length} images selected 
                              {selectedImages.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedImages([])}
                                  className="ml-2"
                                >
                                  Clear selection
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Step 2: Name Your Character</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="training-name">Character Name</Label>
                              <Input
                                id="training-name"
                                placeholder="Give your character a name"
                                value={trainingName}
                                onChange={(e) => setTrainingName(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="training-description">Character Description</Label>
                              <Textarea
                                id="training-description"
                                placeholder="Describe your character's appearance and style"
                                value={trainingDescription}
                                onChange={(e) => setTrainingDescription(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <p className="text-xs text-muted-foreground">
                                This description helps the AI understand what your character looks like.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Step 3: Configure Training</h3>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="base-model-type" 
                                checked={isBaseModelSDVX} 
                                onCheckedChange={setIsBaseModelSDVX} 
                              />
                              <Label htmlFor="base-model-type">Use SD-VX base model (recommended)</Label>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Training will take approximately 30-45 minutes to complete.
                                Once started, you can close this window and check back later.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                      <div className="border rounded-md p-4 h-full flex flex-col">
                        <h3 className="text-lg font-medium mb-4">Step 4: Review & Start</h3>
                        
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>Selected Images</Label>
                            <div className="border rounded-md p-2 h-32 overflow-auto">
                              {selectedImages.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {selectedImages.map((img, idx) => (
                                    <img 
                                      key={idx} 
                                      src={img} 
                                      alt={`Selected ${idx}`} 
                                      className="w-full h-auto aspect-square object-cover rounded-sm" 
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <p className="text-sm text-muted-foreground">No images selected</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Character Details</Label>
                            <div className="border rounded-md p-3 text-sm">
                              <p><strong>Name:</strong> {trainingName || 'Not specified'}</p>
                              <p className="mt-1">
                                <strong>Description:</strong> {trainingDescription || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          
                          {trainingStatus === 'failed' && (
                            <div className="border border-destructive rounded-md p-3 bg-destructive/10">
                              <p className="text-sm text-destructive">
                                Previous training failed. Please check your settings and try again.
                              </p>
                            </div>
                          )}
                          
                          {trainingStatus === 'completed' && (
                            <div className="border border-primary rounded-md p-3 bg-primary/10">
                              <p className="text-sm">
                                Training completed successfully! Your character is now available in the gallery.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          className="mt-6 w-full" 
                          disabled={selectedImages.length === 0 || !trainingName || isTraining}
                          onClick={handleStartTraining}
                        >
                          {isTraining ? (
                            <>
                              <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                              Starting Training...
                            </>
                          ) : (
                            'Start Training'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* CHARACTER GALLERY TAB */}
          <TabsContent value="gallery" className="flex-1 flex flex-col mt-4 overflow-auto">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Character Gallery</CardTitle>
                <CardDescription>
                  Browse and manage your created characters
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {characters.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {characters.map((character) => (
                      <div 
                        key={character.id} 
                        className="border rounded-md overflow-hidden flex flex-col"
                      >
                        <div className="relative">
                          <img 
                            src={character.previewImage} 
                            alt={character.name} 
                            className="w-full h-48 object-cover"
                          />
                          
                          {character.trainingStatus === 'in_progress' && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <SpinnerIcon className="h-8 w-8 animate-spin text-white" />
                              <span className="text-white text-sm mt-2">Training...</span>
                              {character.trainingProgress && (
                                <Progress 
                                  value={character.trainingProgress} 
                                  className="h-1 w-24 mt-2" 
                                />
                              )}
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2">
                            <Badge variant={
                              character.trainingStatus === 'complete' ? 'default' : 
                              character.trainingStatus === 'in_progress' ? 'secondary' : 
                              character.trainingStatus === 'failed' ? 'destructive' : 
                              'outline'
                            }>
                              {character.trainingStatus === 'complete' ? 'Trained' : 
                               character.trainingStatus === 'in_progress' ? 'Training' : 
                               character.trainingStatus === 'failed' ? 'Failed' : 
                               'Concept'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-medium line-clamp-1">{character.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 flex-1">
                            {character.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {character.creationDate.toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="border-t p-2 flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSelectCharacter(character)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleGenerateWithCharacter(character)}
                            disabled={character.trainingStatus !== 'complete'}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="bg-muted/50 rounded-full p-3 mb-4">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Characters Yet</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      Create characters in the Text to Image tab, or train custom models in the LoRA Fine-tuning tab.
                    </p>
                    <Button 
                      className="mt-4"
                      onClick={() => {
                        setActiveTab('text2img');
                        setGenerationMode('character');
                      }}
                    >
                      Create Your First Character
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* HISTORY TAB */}
          <TabsContent value="history" className="flex-1 flex flex-col mt-4 overflow-auto">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
                <CardDescription>
                  Browse your previously generated images and prompts
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {generationHistory.length > 0 ? (
                  <div className="space-y-6">
                    {generationHistory.map((item, idx) => (
                      <div key={idx} className="border rounded-md overflow-hidden">
                        <div className="p-3 border-b bg-muted/40">
                          <p className="text-sm font-medium line-clamp-1">{item.prompt}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 p-2">
                          {item.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <img 
                                src={img} 
                                alt={`Generated ${imgIdx}`} 
                                className="w-full h-auto aspect-square object-cover rounded-sm cursor-pointer"
                                onClick={() => handleViewImage(img)}
                              />
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded-sm">
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveImage(img);
                                  }}
                                >
                                  <DownloadIcon className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPrompt(item.prompt);
                                    setActiveTab('text2img');
                                  }}
                                >
                                  <RefreshIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="bg-muted/50 rounded-full p-3 mb-4">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Generation History</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your generation history will appear here once you create some images.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Image Viewer Dialog */}
      <Dialog open={showResultViewer} onOpenChange={setShowResultViewer}>
        <DialogContent className="max-w-3xl max-h-screen">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <img 
                  src={selectedResult} 
                  alt="Generated image" 
                  className="rounded-md w-full h-auto"
                />
              </div>
              <div className="flex justify-between">
                <div>
                  {generationMode === 'character' && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleSetAsCharacter(selectedResult);
                        setShowResultViewer(false);
                      }}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Save as Character
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveImage(selectedResult)}
                  >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={() => {
                    handleUseImage(selectedResult);
                    setShowResultViewer(false);
                  }}>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Use This Image
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Creating Your First AI Character</DialogTitle>
            <DialogDescription>
              Follow this quick tutorial to learn the complete workflow
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {tutorialStep === 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Create a Character Concept</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by creating a unique character concept in the Text to Image tab.
                      Switch to "Character Creation" mode to access character-specific tools.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Use the Character Builder to define your character's appearance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Choose from starter templates or build your own from scratch</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Generate multiple variations until you find the perfect look</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2">
                    <div className="bg-muted/30 border rounded-md p-4 h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">Character creation interface</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {tutorialStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 2: Select Your Best Images</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you've generated some character concepts, select the best images
                      to use for training a custom AI model.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Generate 4-10 high-quality images of your character</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Save your favorite designs as characters in your gallery</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Include variety in poses and expressions for better results</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2">
                    <div className="bg-muted/30 border rounded-md p-4 h-full flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">Image selection interface</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {tutorialStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 3: Train Your Character Model</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Go to the LoRA Fine-tuning tab to train a custom AI model specific
                      to your character.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Follow the step-by-step wizard to configure your training</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Add a detailed description to help the AI understand your character</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Training takes 30-45 minutes to complete</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2">
                    <div className="bg-muted/30 border rounded-md p-4 h-full flex items-center justify-center">
                      <div className="text-center">
                        <SpinnerIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">Training interface</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {tutorialStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 4: Create Content with Your Character</h3>
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Once training is complete, your character is ready to use for content creation.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Find your trained characters in the Character Gallery</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Generate new content with consistent character appearance</span>
                      </li>
                      <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Create various scenes and scenarios with your character</span>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2">
                    <div className="bg-muted/30 border rounded-md p-4 h-full flex items-center justify-center">
                      <div className="text-center">
                        <CheckIcon className="h-10 w-10 mx-auto text-green-500" />
                        <p className="text-xs text-muted-foreground mt-2">Ready to create content!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowTutorial(false)}
            >
              Skip Tutorial
            </Button>
            <Button onClick={nextTutorialStep}>
              {tutorialStep < 3 ? 'Next Step' : 'Finish'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function WandIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 4V2" />
      <path d="M15 16v-2" />
      <path d="M8 9h2" />
      <path d="M20 9h2" />
      <path d="M17.8 11.8 19 13" />
      <path d="M15 9h0" />
      <path d="M17.8 6.2 19 5" />
      <path d="m3 21 9-9" />
      <path d="M12.2 6.2 11 5" />
    </svg>
  );
}