"use client"

import { Card } from "@/components/ui/card"

export function MapEmbed() {
  return (
    <Card className="overflow-hidden h-full min-h-[400px]">
      <iframe
        src="https://yandex.ru/map-widget/v1/?um=constructor%3Azdorovdv&source=constructor&ll=135.076292%2C48.480200&z=16&pt=135.076292,48.480200,pm2rdm"
        width="100%"
        height="100%"
        style={{ border: 0, minHeight: '400px' }}
        allowFullScreen
        loading="lazy"
        title="Zdorovye clinic map"
      />
    </Card>
  )
}
