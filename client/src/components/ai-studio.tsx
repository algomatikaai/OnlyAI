import { useState, useEffect } from 'react';
import { generateImage, DEFAULT_MODELS, STYLE_PRESETS, DEFAULT_NEGATIVE_PROMPT } from '@/services/modelslab-api';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AIStudioProps {
  open: boolean;
  onClose: () => void;
}

export default function AIStudio({ open, onClose }: AIStudioProps) {
  const { toast } = useToast();
  
  // Form state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0].id);
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [guidance, setGuidance] = useState(7);
  const [steps, setSteps] = useState(30);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [samples, setSamples] = useState(1);
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [seed, setSeed] = useState<number | null>(null);
  const [useRandomSeed, setUseRandomSeed] = useState(true);

  // Results
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [showResultViewer, setShowResultViewer] = useState(false);

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

  // Generate random seed when useRandomSeed is true
  useEffect(() => {
    if (useRandomSeed) {
      setSeed(Math.floor(Math.random() * 2147483647));
    }
  }, [useRandomSeed]);

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">AI Studio</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="text2img" className="mt-2 flex-1 flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="text2img" className="flex-1">Text to Image</TabsTrigger>
            <TabsTrigger value="lora" className="flex-1" disabled>LoRA Fine-tuning</TabsTrigger>
            <TabsTrigger value="history" className="flex-1" disabled>History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text2img" className="flex-1 flex flex-col mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Panel: Generation Controls */}
              <div className="flex flex-col space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Prompt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Describe what you want to generate..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </CardContent>
                </Card>
                
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
              </div>
              
              {/* Right Panel: Results */}
              <div className="flex flex-col space-y-4">
                <Card className="flex-1 flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Results</CardTitle>
                    <CardDescription>Generated images will appear here.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {generating ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <SpinnerIcon className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Generating your images...</p>
                      </div>
                    ) : results.length > 0 ? (
                      <ScrollArea className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {results.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={imageUrl} 
                                alt={`Generated ${index + 1}`} 
                                className="rounded-md w-full object-cover cursor-pointer"
                                onClick={() => handleViewImage(imageUrl)}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200 rounded-md">
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="h-8 w-8" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveImage(imageUrl);
                                  }}
                                >
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
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
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="outline" 
                                  className="h-8 w-8" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUseImage(imageUrl);
                                  }}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-16 w-16 text-muted-foreground" 
                          width="24" 
                          height="24" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        >
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        <div className="text-center">
                          <p className="text-lg font-medium">No images generated yet</p>
                          <p className="text-sm text-muted-foreground">Enter a prompt and click Generate to create images.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleGenerate} 
                      disabled={generating || !prompt.trim()}
                    >
                      {generating ? (
                        <>
                          <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <Dialog open={showResultViewer} onOpenChange={setShowResultViewer}>
            {selectedResult && (
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Generated Image</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                  <img 
                    src={selectedResult} 
                    alt="Generated" 
                    className="w-full h-auto rounded-md"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveImage(selectedResult)}
                  >
                    Download
                  </Button>
                  <Button 
                    onClick={() => handleUseImage(selectedResult)}
                  >
                    Use This Image
                  </Button>
                </div>
              </DialogContent>
            )}
          </Dialog>
        </Tabs>
      </DialogContent>
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