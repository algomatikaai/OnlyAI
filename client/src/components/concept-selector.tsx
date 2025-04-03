import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ConceptSelectorProps {
  concepts: string[];
  onSelect: (imageUrl: string) => void;
  onRegenerate: () => void;
}

export default function ConceptSelector({
  concepts,
  onSelect,
  onRegenerate
}: ConceptSelectorProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Handle selecting a concept
  const handleSelect = (imageUrl: string, index: number) => {
    setSelectedIndex(index);
    onSelect(imageUrl);
  };
  
  // Show full-size preview
  const handleShowPreview = (url: string) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Choose Your Character</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Select the concept that best matches your vision or generate new options
        </p>
      </div>
      
      {concepts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {concepts.map((imageUrl, index) => (
            <div 
              key={index}
              className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selectedIndex === index ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-muted hover:border-muted-foreground'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img 
                src={imageUrl} 
                alt={`Character concept ${index + 1}`}
                className="w-full aspect-[3/4] object-cover"
              />
              
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="opacity-80">
                  Concept {index + 1}
                </Badge>
              </div>
              
              {(hoveredIndex === index || selectedIndex === index) && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 p-4 transition-opacity">
                  <Button 
                    variant="default" 
                    onClick={() => handleSelect(imageUrl, index)}
                  >
                    {selectedIndex === index ? 'Selected' : 'Select This Character'}
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    onClick={() => handleShowPreview(imageUrl)}
                  >
                    View Larger
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No concepts generated yet</p>
        </div>
      )}
      
      <div className="flex justify-center gap-4 mt-6">
        <Button variant="outline" onClick={onRegenerate}>
          Generate New Options
        </Button>
        
        {selectedIndex !== null && (
          <Button variant="default">
            Continue with Selected
          </Button>
        )}
      </div>
      
      {/* Full-size preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Character Preview</DialogTitle>
            <DialogDescription>
              View the full-sized character concept
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={previewUrl} 
              alt="Character preview" 
              className="max-h-[70vh] object-contain rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}