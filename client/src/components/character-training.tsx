import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface CharacterTrainingProps {
  progress: number;
  characterName: string;
  estimatedTimeRemaining?: number;
  onCancel?: () => void;
  status: 'training' | 'completed' | 'failed' | 'idle';
}

export default function CharacterTraining({
  progress,
  characterName,
  estimatedTimeRemaining = 0,
  onCancel,
  status
}: CharacterTrainingProps) {
  // Format remaining time
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s remaining`;
    }
    return `${remainingSeconds}s remaining`;
  };
  
  // Get status message
  const getStatusMessage = () => {
    if (status === 'failed') {
      return 'Training failed';
    }
    
    if (status === 'completed') {
      return 'Training completed successfully';
    }
    
    if (progress < 30) {
      return 'Generating character variations...';
    } else if (progress < 80) {
      return 'Training AI model (this takes 20-40 minutes)...';
    } else {
      return 'Finalizing your character...';
    }
  };
  
  return (
    <div className="text-center space-y-6 py-10">
      <div className="flex items-center justify-center mb-4">
        {status === 'failed' ? (
          <Badge variant="destructive" className="text-base px-3 py-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            Training Failed
          </Badge>
        ) : status === 'completed' ? (
          <Badge variant="default" className="text-base px-3 py-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-4 w-4 mr-1" />
            Training Complete
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-base px-3 py-1">
            <Clock className="h-4 w-4 mr-1 animate-pulse" />
            Training in Progress
          </Badge>
        )}
      </div>
      
      <h3 className="text-xl font-medium">Creating Your Character</h3>
      
      <div className="relative w-full max-w-md mx-auto">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {getStatusMessage()}
        </p>
        
        {estimatedTimeRemaining > 0 && status === 'training' && (
          <p className="text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3 inline-block mr-1" />
            {formatTimeRemaining(estimatedTimeRemaining)}
          </p>
        )}
      </div>
      
      <Separator className="my-6" />
      
      <div className="bg-muted rounded-lg p-6 max-w-md mx-auto mt-4">
        <p className="mb-4">
          Your character "<span className="font-semibold">{characterName}</span>" is being created.
        </p>
        
        {status === 'training' && (
          <div className="text-sm text-muted-foreground space-y-4">
            <p>
              This process typically takes 20-40 minutes to complete. You'll receive a notification
              when your character is ready to use.
            </p>
            <p>
              Feel free to continue using other features while you wait, or you can close this
              dialog and check back later.
            </p>
            
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel Training
              </Button>
            )}
          </div>
        )}
        
        {status === 'completed' && (
          <div className="text-sm text-muted-foreground">
            <p className="text-green-600 dark:text-green-400 font-medium">
              Your character has been successfully created and is ready to use!
            </p>
            <p className="mt-3">
              You can now generate new content using this character from the Character Gallery.
            </p>
          </div>
        )}
        
        {status === 'failed' && (
          <div className="text-sm text-destructive space-y-2">
            <p>Unfortunately, the character training process failed.</p>
            <p>This could be due to server issues or problems with the training images.</p>
            <p className="mt-3 text-muted-foreground">
              Please try again with different images or settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}