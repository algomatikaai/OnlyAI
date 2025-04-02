import { useState } from 'react';
import { generateImage } from '../services/modelslab-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function ModelslabTest() {
  const [prompt, setPrompt] = useState('a stunning portrait of a cyberpunk anime character');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const response = await generateImage({
        model_id: 'midjourney',
        prompt,
        negative_prompt: 'blurry, bad anatomy, bad hands, cropped, worst quality',
        width: '512',
        height: '512',
        samples: '1',
        safety_checker: 'no',
      });

      if (response.output && response.output.length > 0) {
        setGeneratedImage(response.output[0]);
        toast({
          title: 'Success!',
          description: 'Image generated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No image was generated',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>ModelsLab API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full"
          />
        </div>
        
        {generatedImage && (
          <div className="mt-4">
            <img 
              src={generatedImage} 
              alt="Generated from ModelsLab" 
              className="w-full rounded-md shadow-md" 
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </CardFooter>
    </Card>
  );
}