'use client'

import { useState } from 'react'
import { type Quiz } from '@/data/intro-module'
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function QuizCard({
  quiz,
  index,
  onComplete,
}: {
  quiz: Quiz
  index: number
  onComplete: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const isCorrect = selected === quiz.correctId

  function handleSelect(id: string) {
    if (revealed) return
    setSelected(id)
  }

  function handleCheck() {
    if (!selected) return
    setRevealed(true)
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <HelpCircle className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground">Вопрос {index + 1}</span>
          <h3 className="text-base font-semibold text-foreground mt-0.5">{quiz.question}</h3>
        </div>
      </div>

      <div className="grid gap-2">
        {quiz.options.map((opt) => {
          const isThis = selected === opt.id
          const isCorrectOpt = opt.id === quiz.correctId

          let optStyle = 'border-border hover:border-primary/40 hover:bg-accent/50 cursor-pointer'
          if (revealed && isCorrectOpt) {
            optStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800'
          } else if (revealed && isThis && !isCorrect) {
            optStyle = 'border-red-300 bg-red-50 text-red-800'
          } else if (isThis && !revealed) {
            optStyle = 'border-primary bg-primary/5'
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={revealed}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border text-sm text-left transition-all',
                optStyle
              )}
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0',
                  revealed && isCorrectOpt
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : revealed && isThis && !isCorrect
                    ? 'border-red-400 bg-red-400 text-white'
                    : isThis
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                )}
              >
                {revealed && isCorrectOpt ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : revealed && isThis && !isCorrect ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  opt.id.toUpperCase()
                )}
              </span>
              <span>{opt.text}</span>
            </button>
          )
        })}
      </div>

      {!revealed && (
        <Button onClick={handleCheck} disabled={!selected} className="w-full">
          Проверить ответ
        </Button>
      )}

      {revealed && (
        <div
          className={cn(
            'rounded-lg p-4 text-sm leading-relaxed',
            isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
          )}
        >
          <div className="flex items-center gap-2 mb-1 font-semibold">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Правильно!
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Неправильно
              </>
            )}
          </div>
          {quiz.explanation}
        </div>
      )}

      {revealed && (
        <Button variant="ghost" onClick={onComplete} className="w-full">
          Далее <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  )
}

export function QuizSection({
  quizzes,
  onAllComplete,
}: {
  quizzes: Quiz[]
  onAllComplete?: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  function handleComplete() {
    if (current < quizzes.length - 1) {
      setCurrent((c) => c + 1)
    } else {
      setFinished(true)
      onAllComplete?.()
    }
  }

  if (finished) {
    const pct = Math.round((score / quizzes.length) * 100)
    return (
      <div className="rounded-xl border bg-card p-8 text-center space-y-3">
        <div className="text-4xl font-bold text-primary">{pct}%</div>
        <p className="text-muted-foreground text-sm">
          Вы ответили правильно на {score} из {quizzes.length} вопросов
        </p>
        <p className="text-xs text-muted-foreground/60">
          {pct >= 80 ? 'Отличный результат!' : pct >= 50 ? 'Хороший результат, но есть что повторить.' : 'Рекомендуем перечитать материал урока.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Проверьте себя</h3>
        <span className="text-xs text-muted-foreground">
          {current + 1} / {quizzes.length}
        </span>
      </div>
      <QuizCard quiz={quizzes[current]} index={current} onComplete={handleComplete} />
    </div>
  )
}
