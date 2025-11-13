import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { useMicrophone } from "@/hooks/use-microphone"
import { motion } from "framer-motion"

interface MuteButtonProps {
  audioStream: MediaStream | null;
}

export function MuteButton({ audioStream }: MuteButtonProps) {
  const { isMuted, toggleMute } = useMicrophone(audioStream);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className="w-10 h-10"
      >
        {isMuted ? (
          <MicOff className="h-5 w-5 text-destructive" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
    </motion.div>
  );
}
