import Transcriber from "@/components/ui/transcriber"
import { Conversation } from "@/lib/conversations"

export function MessageControls({ conversation }: { conversation: Conversation[] }) {
  if (conversation.length === 0) return null

  return <Transcriber conversation={conversation} />
}
