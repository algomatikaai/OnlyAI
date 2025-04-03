import EnhancedAIStudio from './enhanced-ai-studio';

interface AIStudioProps {
  open: boolean;
  onClose: () => void;
}

// Simple wrapper component that delegates to the enhanced AI Studio
export default function AIStudio({ open, onClose }: AIStudioProps) {
  return <EnhancedAIStudio open={open} onClose={onClose} />;
}