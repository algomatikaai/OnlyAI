import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export interface CharacterDesign {
  style: 'realistic' | 'anime' | 'art';
  bodyType: string;
  features: string[];
  hairStyle: string;
  distinctiveFeatures: string[];
  aestheticStyle: string;
  customPrompt: string;
}

interface CharacterDesignerProps { 
  design: CharacterDesign;
  onChange: (design: CharacterDesign) => void; 
  onGenerate: () => void;
}

export default function CharacterDesigner({ 
  design, 
  onChange, 
  onGenerate 
}: CharacterDesignerProps) {
  const [bodyTypeDetails, setBodyTypeDetails] = useState<string>('');
  const [hairDetails, setHairDetails] = useState<string>('');
  
  // Style options with visual examples
  const styleOptions = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic human character with natural features and lighting' },
    { value: 'anime', label: 'Anime', description: 'A stylized anime character with vibrant colors and expressive features' },
    { value: 'art', label: 'Digital Art', description: 'Artistic stylized character with creative interpretation' }
  ];
  
  // Body type options
  const bodyTypeOptions = [
    { value: 'slim', label: 'Slim' },
    { value: 'curvy', label: 'Curvy' },
    { value: 'athletic', label: 'Athletic' },
    { value: 'plus-size', label: 'Plus Size' }
  ];
  
  // Hair style options
  const hairStyleOptions = [
    { value: 'long-black', label: 'Long Black' },
    { value: 'long-blonde', label: 'Long Blonde' },
    { value: 'short-brown', label: 'Short Brown' },
    { value: 'pixie-cut', label: 'Pixie Cut' },
    { value: 'colored-hair', label: 'Colored Hair' },
    { value: 'custom', label: 'Custom (specify below)' }
  ];
  
  // Distinctive features
  const featureOptions = [
    { value: 'freckles', label: 'Freckles' },
    { value: 'glasses', label: 'Glasses' },
    { value: 'tattoos', label: 'Tattoos' },
    { value: 'scars', label: 'Scars' },
    { value: 'heterochromia', label: 'Different colored eyes' },
    { value: 'piercings', label: 'Piercings' }
  ];
  
  // Aesthetic style options
  const aestheticOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'goth', label: 'Gothic' },
    { value: 'cyberpunk', label: 'Cyberpunk' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'pinup', label: 'Pin-up' }
  ];
  
  // Handle changes for individual attributes
  const handleStyleChange = (value: string) => {
    onChange({ ...design, style: value as 'realistic' | 'anime' | 'art' });
  };
  
  const handleBodyTypeChange = (value: string) => {
    let finalBodyType = value;
    if (value === 'custom' && bodyTypeDetails) {
      finalBodyType = bodyTypeDetails;
    }
    onChange({ ...design, bodyType: finalBodyType });
  };
  
  const handleHairStyleChange = (value: string) => {
    let finalHairStyle = value;
    if (value === 'custom' && hairDetails) {
      finalHairStyle = hairDetails;
    }
    onChange({ ...design, hairStyle: finalHairStyle });
  };
  
  const handleFeatureToggle = (feature: string) => {
    const features = design.distinctiveFeatures.includes(feature)
      ? design.distinctiveFeatures.filter(f => f !== feature)
      : [...design.distinctiveFeatures, feature];
    
    onChange({ ...design, distinctiveFeatures: features });
  };
  
  const handleAestheticChange = (value: string) => {
    onChange({ ...design, aestheticStyle: value });
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...design, customPrompt: e.target.value });
  };
  
  const handleBodyTypeDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBodyTypeDetails(e.target.value);
    if (design.bodyType === 'custom') {
      onChange({ ...design, bodyType: e.target.value });
    }
  };
  
  const handleHairDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHairDetails(e.target.value);
    if (design.hairStyle === 'custom') {
      onChange({ ...design, hairStyle: e.target.value });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Character Style</h3>
        <div className="grid grid-cols-3 gap-4">
          {styleOptions.map(style => (
            <Card 
              key={style.value}
              className={`relative p-4 cursor-pointer hover:border-primary transition-colors ${design.style === style.value ? 'border-primary bg-muted/50' : ''}`}
              onClick={() => handleStyleChange(style.value)}
            >
              <div className="text-center">
                <div className="font-medium">{style.label}</div>
                <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Body Type</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Select the general body shape for your character</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup
          value={design.bodyType}
          onValueChange={handleBodyTypeChange}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          {bodyTypeOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem id={`body-${option.value}`} value={option.value} />
              <Label htmlFor={`body-${option.value}`}>{option.label}</Label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="body-custom" value="custom" />
            <Label htmlFor="body-custom">Custom</Label>
          </div>
        </RadioGroup>
        {(design.bodyType === 'custom' || bodyTypeDetails) && (
          <Input
            className="mt-2"
            placeholder="Describe body type..."
            value={bodyTypeDetails}
            onChange={handleBodyTypeDetailsChange}
          />
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Hair Style</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Select hair style and color for your character</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup
          value={design.hairStyle}
          onValueChange={handleHairStyleChange}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {hairStyleOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem id={`hair-${option.value}`} value={option.value} />
              <Label htmlFor={`hair-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {(design.hairStyle === 'custom' || hairDetails) && (
          <Input
            className="mt-2"
            placeholder="Describe hair style..."
            value={hairDetails}
            onChange={handleHairDetailsChange}
          />
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Distinctive Features</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Select additional features to make your character unique</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {featureOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox 
                id={`feature-${option.value}`} 
                checked={design.distinctiveFeatures.includes(option.value)} 
                onCheckedChange={() => handleFeatureToggle(option.value)}
              />
              <Label htmlFor={`feature-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Aesthetic Style</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Select the overall style/theme for your character</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <RadioGroup
          value={design.aestheticStyle}
          onValueChange={handleAestheticChange}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {aestheticOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem id={`aesthetic-${option.value}`} value={option.value} />
              <Label htmlFor={`aesthetic-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="customPrompt">Additional Details (Optional)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <InfoIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Add any specific details about your character that weren't covered by the options above</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="customPrompt"
          value={design.customPrompt}
          onChange={handlePromptChange}
          placeholder="Add any specific details about your character..."
          className="min-h-[100px]"
        />
      </div>
      
      <Button 
        onClick={onGenerate} 
        className="w-full"
        size="lg"
        variant="default"
      >
        Generate Character Concepts
      </Button>
    </div>
  );
}