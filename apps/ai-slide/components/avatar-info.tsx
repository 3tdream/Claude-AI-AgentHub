import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { systemPrompt } from "@/config/openai"
import { useLanguageStore } from "@/hooks/use-language-store"
import { translations } from "@/lib/translations"

export interface AgentConfig {
  name: string;
  role: string;
  prompt: string;
}

const defaultConfig: AgentConfig = {
  name: "Jacqueline Kovalenko",
  role: "ai buddy",
  prompt: systemPrompt
}

interface AvatarInfoProps {
  onConfigChange?: (config: AgentConfig) => void;
  hideEdit?: boolean;
}

export function AvatarInfo({ onConfigChange, hideEdit = false }: AvatarInfoProps) {
  const [config, setConfig] = useState<AgentConfig>(defaultConfig)
  const [open, setOpen] = useState(false)
  const { language } = useLanguageStore()
  const t = translations[language]

  useEffect(() => {
    const stored = localStorage.getItem('agentConfig')
    if (stored) {
      const storedConfig = JSON.parse(stored)
      setConfig(storedConfig)
      onConfigChange?.(storedConfig)
    }
  }, [onConfigChange])

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newConfig = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      prompt: formData.get('prompt') as string,
    }
    setConfig(newConfig);
    localStorage.setItem('agentConfig', JSON.stringify(newConfig));
    onConfigChange?.(newConfig);
    setOpen(false);
  }

  return (
    <div className="flex flex-col items-center space-y-2 mb-8">
      <Avatar className="h-32 w-32">
        <AvatarImage src="/avatars/jacqueline-avatar.png" alt={config.name} />
      </Avatar>
      <div className="text-center">
        <h3 className="font-semibold">{config.name}</h3>
        <p className="text-sm text-muted-foreground">{config.role}</p>
      </div>
      {!hideEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {t.buttons.edit}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Agent Configuration</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={config.name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  defaultValue={config.role}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt</Label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  defaultValue={config.prompt}
                  className="h-[200px]"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
