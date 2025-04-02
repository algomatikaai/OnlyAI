import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Character } from "@shared/schema";

interface AIStudioProps {
  open: boolean;
  onClose: () => void;
}

const styles = [
  { id: "realistic", name: "Realistic", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "anime", name: "Anime", image: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: "fantasy", name: "Fantasy", image: "https://randomuser.me/api/portraits/women/90.jpg" },
  { id: "artistic", name: "Artistic", image: "https://randomuser.me/api/portraits/women/43.jpg" },
  { id: "custom", name: "Custom", icon: "plus" },
];

export default function AIStudio({ open, onClose }: AIStudioProps) {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedStyle, setSelectedStyle] = useState(styles[0].id);
  const [promptText, setPromptText] = useState("");
  const [contentType, setContentType] = useState("free");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "complete">("idle");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<number>(-1);

  // Get all characters for the current user
  const { data: characters } = useQuery<Character[]>({
    queryKey: ["/api/characters/user/1"], // Assuming user ID 1 for the demo
  });

  const handleGenerate = () => {
    if (promptText.trim() === "") return;
    
    setGenerationStatus("generating");
    
    // Simulate API call to generate images
    setTimeout(() => {
      // Mock response with random user images
      const mockImages = [
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/women/68.jpg",
        "https://randomuser.me/api/portraits/women/90.jpg",
        "https://randomuser.me/api/portraits/women/91.jpg",
      ];
      
      setGeneratedImages(mockImages);
      setGenerationStatus("complete");
    }, 2000);
  };

  const handleRegenerate = () => {
    setGenerationStatus("generating");
    
    // Simulate API call to regenerate
    setTimeout(() => {
      // Mock response with different random user images
      const mockImages = [
        "https://randomuser.me/api/portraits/women/42.jpg",
        "https://randomuser.me/api/portraits/women/63.jpg",
        "https://randomuser.me/api/portraits/women/92.jpg",
        "https://randomuser.me/api/portraits/women/93.jpg",
      ];
      
      setGeneratedImages(mockImages);
      setGenerationStatus("complete");
    }, 2000);
  };
  
  const handleUseSelected = () => {
    // In a real app, would submit the selected image to create a post
    // For now, just close the dialog
    onClose();
    
    // Reset state for next time
    setGenerationStatus("idle");
    setGeneratedImages([]);
    setSelectedImage(-1);
    setPromptText("");
  };

  // Reset state when dialog is closed
  const handleDialogClose = () => {
    onClose();
    setGenerationStatus("idle");
    setGeneratedImages([]);
    setSelectedImage(-1);
    setPromptText("");
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create AI Content</DialogTitle>
          <DialogClose />
        </DialogHeader>
        
        <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            {/* Character Selection */}
            <div>
              <Label className="block text-white mb-2 font-medium">Choose Character</Label>
              <Select>
                <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3A3A3C]/30">
                  <SelectValue placeholder="Select Character" />
                </SelectTrigger>
                <SelectContent>
                  {characters?.map((character) => (
                    <SelectItem key={character.id} value={character.id.toString()}>
                      {character.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">Create New Character...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Style Selection */}
            <div>
              <Label className="block text-white mb-2 font-medium">Style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {styles.map((style) => (
                  <div
                    key={style.id}
                    className={cn(
                      "bg-[#1E1E1E] cursor-pointer rounded-lg p-3 flex flex-col items-center",
                      selectedStyle === style.id
                        ? "border-2 border-primary"
                        : "border border-[#3A3A3C]/30"
                    )}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#2C2C2E] mb-2 overflow-hidden">
                      {style.image ? (
                        <img
                          src={style.image}
                          alt={style.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#AFAFAF]">
                          <PlusIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium">{style.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Prompt Input */}
            <div>
              <Label className="block text-white mb-2 font-medium">Prompt</Label>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-[#1E1E1E] border-[#3A3A3C]/30 min-h-[120px]"
                placeholder="Describe the scene, outfit, pose, and setting for your AI character..."
              />
              <div className="flex justify-between mt-2">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="bg-[#1E1E1E] text-[#AFAFAF] hover:bg-[#2C2C2E]">
                    Template
                  </Button>
                  <Button variant="outline" size="sm" className="bg-[#1E1E1E] text-[#AFAFAF] hover:bg-[#2C2C2E]">
                    History
                  </Button>
                </div>
                <p className="text-[#AFAFAF] text-xs">{promptText.length}/1000 characters</p>
              </div>
            </div>
            
            {/* Content Type & Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-white mb-2 font-medium">Content Type</Label>
                <RadioGroup value={contentType} onValueChange={setContentType}>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free">Free Content</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="premium" id="premium" />
                      <Label htmlFor="premium">Premium Content</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className="block text-white mb-2 font-medium">Content Rating</Label>
                <Select>
                  <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3A3A3C]/30">
                    <SelectValue placeholder="SFW - Safe for Work" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sfw">SFW - Safe for Work</SelectItem>
                    <SelectItem value="suggestive">Suggestive - No Nudity</SelectItem>
                    <SelectItem value="nsfw-artistic">NSFW - Artistic Nudity</SelectItem>
                    <SelectItem value="nsfw-explicit">NSFW - Explicit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Advanced Settings (Collapsible) */}
            <div>
              <Button 
                variant="ghost" 
                className="flex items-center justify-between w-full text-white hover:text-primary py-2 border-b border-[#3A3A3C]/20"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <span className="font-medium">Advanced Settings</span>
                <ChevronIcon className={`h-5 w-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
              
              {showAdvanced && (
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-white mb-2 text-sm">Aspect Ratio</Label>
                    <Select>
                      <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3A3A3C]/30 h-9 text-sm">
                        <SelectValue placeholder="Portrait (3:4)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                        <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-white mb-2 text-sm">Quality</Label>
                    <Select>
                      <SelectTrigger className="w-full bg-[#1E1E1E] border-[#3A3A3C]/30 h-9 text-sm">
                        <SelectValue placeholder="High" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Generate Button */}
            <div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-medium"
                onClick={handleGenerate}
                disabled={generationStatus === "generating" || promptText.trim() === ""}
              >
                {generationStatus === "generating" ? (
                  <>
                    <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" /> 
                    Generating...
                  </>
                ) : (
                  "Generate Images"
                )}
              </Button>
            </div>
            
            {/* Results Section */}
            {generationStatus === "complete" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Results</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/90"
                    onClick={handleRegenerate}
                  >
                    <RefreshIcon className="mr-1 h-4 w-4" /> Regenerate
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedImages.map((image, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "aspect-[3/4] bg-[#2C2C2E] rounded-lg overflow-hidden relative group cursor-pointer",
                        selectedImage === index && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img 
                        src={image}
                        alt={`Generated Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity",
                          selectedImage === index ? "bg-primary/20" : "bg-primary/10 opacity-0 group-hover:opacity-100"
                        )}
                      >
                        {selectedImage === index && (
                          <div className="bg-primary text-white p-2 rounded-full">
                            <CheckIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end mt-6 space-x-4">
                  <Button 
                    variant="outline"
                    className="bg-[#1E1E1E] hover:bg-[#2C2C2E] text-white"
                    onClick={handleGenerate}
                  >
                    Generate More
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    disabled={selectedImage === -1}
                    onClick={handleUseSelected}
                  >
                    Use Selected
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="characters" className="space-y-6">
            <p className="text-[#AFAFAF]">Manage your AI characters here.</p>
            
            {/* Character management interface would go here */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {characters?.map((character) => (
                <div key={character.id} className="bg-[#2C2C2E] rounded-lg p-4">
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden">
                    {character.profilePicture ? (
                      <img 
                        src={character.profilePicture}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#3A3A3C] text-white text-xl">
                        {character.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-center font-medium">{character.name}</h3>
                  <p className="text-center text-xs text-[#AFAFAF] mt-1">{character.style}</p>
                </div>
              ))}
              
              <div className="bg-[#2C2C2E] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3A3A3C]">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#3A3A3C] mb-3 flex items-center justify-center">
                  <PlusIcon className="h-8 w-8 text-[#AFAFAF]" />
                </div>
                <h3 className="text-center font-medium">Create New</h3>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <p className="text-[#AFAFAF]">View your generation history here.</p>
            
            {/* Generation history would go here */}
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-[#2C2C2E] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Generation #{item}</h3>
                      <p className="text-xs text-[#AFAFAF] mt-1">2 days ago</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#AFAFAF]">
                      <RefreshIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-[#AFAFAF] mt-2">
                    Prompt: A beautiful AI character in a futuristic setting...
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[1, 2, 3, 4].map((img) => (
                      <div key={img} className="aspect-[3/4] rounded bg-[#3A3A3C] overflow-hidden">
                        <img 
                          src={`https://randomuser.me/api/portraits/women/${40 + img}.jpg`}
                          alt={`History ${img}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
