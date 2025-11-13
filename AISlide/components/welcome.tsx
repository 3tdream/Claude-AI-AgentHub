import { Badge } from "@/components/ui/badge"

export const Welcome = () => {
  return (
    <div className="text-center mb-8 rounded-lg p-4">
      <div className="flex justify-center items-center mx-auto gap-2 h-full w-full mb-2">
        <Badge className="text-xl font-medium motion-preset-slide-left-md">
          OpenAI Realtime API
        </Badge>
      </div>
      <h1 className="text-4xl font-bold mb-4 motion-preset-slide-up-lg">
        Voice AI Demo
      </h1>
      <p className="max-w-2xl mx-auto motion-preset-slide-down">
        Experience real-time voice interactions using OpenAI&apos;s WebRTC API
      </p>
    </div>
  )
}

export default Welcome;
