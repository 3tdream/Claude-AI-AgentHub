"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { SectionHeading } from "@/components/shared/section-heading"
import { useLanguageStore } from "@/lib/use-language-store"
import { translations } from "@/lib/translations"

const testimonials = {
  ru: [
    { name: 'Анна К.', text: 'Прекрасная клиника! Прохожу курс лазерной эпиляции — результат заметен уже после первой процедуры. Персонал очень внимательный.', rating: 5 },
    { name: 'Елена М.', text: 'Делала биоревитализацию у косметолога Марии Ивановны. Кожа стала значительно лучше! Рекомендую всем.', rating: 5 },
    { name: 'Ольга С.', text: 'Обратилась с проблемой кожи, врач-дерматолог провёл полное обследование и назначил эффективное лечение. Очень довольна!', rating: 5 },
    { name: 'Наталья В.', text: 'Удаляла родинку — быстро, безболезненно, без следа. Спасибо за профессионализм!', rating: 5 },
    { name: 'Ирина П.', text: 'Хожу на LPG-массаж уже месяц. Фигура заметно подтянулась, кожа стала гладкой. Отличный результат!', rating: 4 },
  ],
  en: [
    { name: 'Anna K.', text: 'Wonderful clinic! I\'m doing laser hair removal — the result is noticeable after the first procedure. Very attentive staff.', rating: 5 },
    { name: 'Elena M.', text: 'Had biorevitalization with cosmetologist Maria. My skin has improved significantly! Highly recommend.', rating: 5 },
    { name: 'Olga S.', text: 'Came with a skin problem, the dermatologist conducted a full examination and prescribed effective treatment. Very satisfied!', rating: 5 },
    { name: 'Natalia V.', text: 'Had a mole removed — quick, painless, no trace. Thank you for your professionalism!', rating: 5 },
    { name: 'Irina P.', text: 'Been going for LPG massage for a month. My figure is noticeably tighter, skin is smooth. Excellent result!', rating: 4 },
  ],
}

export function TestimonialsSection() {
  const { language } = useLanguageStore()
  const t = translations[language]
  const items = testimonials[language]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-8">
        <SectionHeading title={t.testimonials.title} subtitle={t.testimonials.subtitle} />

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="min-w-[300px] md:min-w-[350px] snap-start"
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-4 h-4 ${si < item.rating ? 'fill-gold text-gold' : 'text-border'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.text}</p>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
