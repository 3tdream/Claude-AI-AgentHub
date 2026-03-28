"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  FileText,
  Sparkles,
  Layout,
  Download,
  ArrowRight,
  Plus,
  Trash2,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { useCVStore } from "@/lib/cv-store"

const features = [
  {
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    title: "Multi-Step Form",
    description: "Guided step-by-step form to fill in all your CV details",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-blue-600" />,
    title: "AI Assistant",
    description: "Get AI help to improve your text and tailor it to job descriptions",
  },
  {
    icon: <Layout className="w-8 h-8 text-blue-600" />,
    title: "3 Templates",
    description: "Choose from Modern, Classic, or Minimal CV templates",
  },
  {
    icon: <Download className="w-8 h-8 text-blue-600" />,
    title: "PDF Export",
    description: "Download your polished CV as a professional PDF",
  },
]

export default function HomePage() {
  const { savedCVs, loadCV, deleteCV, createNewCV } = useCVStore()
  const router = useRouter()

  const handleLoadCV = (id: string) => {
    loadCV(id)
    router.push("/builder")
  }

  const handleNewCV = () => {
    createNewCV()
    router.push("/builder")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <FileText className="w-5 h-5 text-blue-600" />
            CV Creator
          </div>
          <Button size="sm" onClick={handleNewCV}>
            <Plus className="w-4 h-4 mr-1" /> New CV
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold tracking-tight">
              Build Your Perfect CV
              <br />
              <span className="text-blue-600">with AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              Create a professional, tailored CV in minutes. Our AI assistant
              helps you write compelling content and choose the right template.
            </p>
            <div className="mt-8 flex gap-4 justify-center">
              <Button size="lg" onClick={handleNewCV}>
                Start Building <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link href="/preview">
                <Button variant="outline" size="lg">
                  Preview Templates
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Saved CVs */}
        {savedCVs.length > 0 && (
          <section className="container mx-auto px-6 pb-12">
            <h2 className="text-2xl font-semibold mb-6">Your CVs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCVs
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((cv) => (
                  <Card
                    key={cv.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleLoadCV(cv.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{cv.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cv.data.personalInfo.title || "No title"}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(cv.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCV(cv.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-dashed"
                onClick={handleNewCV}
              >
                <CardContent className="pt-6 flex flex-col items-center justify-center text-muted-foreground">
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-sm">Create New CV</span>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="container mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        CV Creator — AI-Powered Resume Builder
      </footer>
    </div>
  )
}
