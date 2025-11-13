import { Button } from "@/components/ui/button"
import { WandSparkles } from "lucide-react"
import { motion } from "framer-motion"

interface WandButtonProps {
  dataChannel: RTCDataChannel | null;
}

export function WandButton({ dataChannel }: WandButtonProps) {
  const handleClick = () => {
    if (!dataChannel) return;

    // Send message to trigger AI response
    const userMessage = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: 'Please come up with an interesting and surprising topic for us to discuss.'
        }]
      }
    };

    // Send the message
    dataChannel.send(JSON.stringify(userMessage));

    // Trigger the voice response
    const responseCreate = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio']
      }
    };

    dataChannel.send(JSON.stringify(responseCreate));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        className="w-10 h-10"
      >
        <WandSparkles className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}
