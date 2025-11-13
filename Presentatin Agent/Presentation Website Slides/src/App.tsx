import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Slide } from "./components/Slide";
import { SlideContent } from "./components/SlideContent";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 12;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + totalSlides) % totalSlides,
    );
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const slides = [
    // Slide 1: Title
    <Slide
      key={0}
      background="https://images.unsplash.com/photo-1759884247144-53d52c31f859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbm5vdmF0aW9uJTIwZGlnaXRhbCUyMHRyYW5zZm9ybWF0aW9ufGVufDF8fHx8MTc2MTEzNTM4OXww&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent>
        <div className="flex flex-col gap-8 items-center">
          <Badge className="bg-blue-500 text-white px-6 py-2">
            A Transformation Story
          </Badge>
          <h1 className="text-white text-6xl md:text-8xl">
            From Heritage to Innovation
          </h1>
          <h2 className="text-white/90 text-2xl md:text-4xl">
            The Journey to Becoming the Best AI College
          </h2>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 2: The Beginning
    <Slide
      key={1}
      background="https://images.unsplash.com/photo-1690464901049-432440757c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGQlMjB1bml2ZXJzaXR5JTIwYnVpbGRpbmclMjBoaXN0b3JpY3xlbnwxfHx8fDE3NjExMzUzODl8MA&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent alignment="left">
        <div className="flex flex-col gap-6">
          <Badge className="bg-amber-500 text-white px-4 py-2 w-fit">
            Chapter 1: Heritage
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            The Beginning
          </h1>
          <div className="text-white/90 text-xl md:text-2xl space-y-4">
            <p>
              Founded in 1950, our institution stood as a beacon
              of traditional education for over seven decades.
            </p>
            <p>
              Classic lecture halls, timeless libraries, and a
              commitment to foundational knowledge.
            </p>
            <p className="text-amber-200 text-2xl md:text-3xl">
              But the world was changing...
            </p>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 3: The Challenge
    <Slide
      key={2}
      background="linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
    >
      <SlideContent>
        <div className="flex flex-col gap-8 items-center">
          <Badge className="bg-red-500 text-white px-4 py-2">
            Chapter 2: The Challenge
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            A Wake-Up Call
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20">
              <div className="text-5xl mb-4">📉</div>
              <h3 className="text-white text-2xl mb-2">
                Declining Enrollment
              </h3>
              <p className="text-white/80">
                Students seeking modern tech programs
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-white text-2xl mb-2">
                Outdated Curriculum
              </h3>
              <p className="text-white/80">
                Tech industry moving at lightning speed
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-white text-2xl mb-2">
                Need for Change
              </h3>
              <p className="text-white/80">
                Adapt or become irrelevant
              </p>
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 4: The Vision
    <Slide
      key={3}
      background="linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)"
    >
      <SlideContent>
        <div className="flex flex-col gap-8">
          <Badge className="bg-purple-500 text-white px-4 py-2 w-fit mx-auto">
            Chapter 3: The Vision
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            A Bold Decision
          </h1>
          <div className="text-white/90 text-2xl md:text-3xl space-y-6 text-center max-w-4xl mx-auto">
            <p>
              In 2020, our board made a revolutionary choice:
            </p>
            <p className="text-purple-300 text-3xl md:text-5xl">
              "We will become the world's leading AI-focused
              institution"
            </p>
            <p className="text-xl md:text-2xl">
              A five-year transformation plan was born
            </p>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 5: Phase 1 - Infrastructure
    <Slide
      key={4}
      background="https://images.unsplash.com/photo-1732115234692-3ee71d5363af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNobm9sb2d5JTIwY2FtcHVzfGVufDF8fHx8MTc2MTExNTA1OHww&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent alignment="left">
        <div className="flex flex-col gap-6">
          <Badge className="bg-cyan-500 text-white px-4 py-2 w-fit">
            Phase 1: 2020-2021
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            Digital Infrastructure
          </h1>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 space-y-4 text-xl">
            <p className="text-white/90">
              ✓ Campus-wide fiber optic network
            </p>
            <p className="text-white/90">
              ✓ GPU clusters for machine learning
            </p>
            <p className="text-white/90">
              ✓ Cloud computing partnerships
            </p>
            <p className="text-white/90">
              ✓ Smart classrooms with AI assistants
            </p>
            <p className="text-cyan-200 text-2xl">
              Investment: $50M
            </p>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 6: Phase 2 - Curriculum
    <Slide
      key={5}
      background="linear-gradient(135deg, #065f46 0%, #064e3b 100%)"
    >
      <SlideContent>
        <div className="flex flex-col gap-8">
          <Badge className="bg-green-500 text-white px-4 py-2 w-fit mx-auto">
            Phase 2: 2021-2022
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            AI-First Curriculum
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <h3 className="text-white text-2xl mb-4">
                New Programs
              </h3>
              <ul className="text-white/90 space-y-2 text-lg">
                <li>• AI & Machine Learning</li>
                <li>• Data Science</li>
                <li>• Robotics Engineering</li>
                <li>• Neural Networks</li>
                <li>• AI Ethics & Philosophy</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <h3 className="text-white text-2xl mb-4">
                Partnerships
              </h3>
              <ul className="text-white/90 space-y-2 text-lg">
                <li>• Google AI Research</li>
                <li>• OpenAI Education</li>
                <li>• MIT AI Labs</li>
                <li>• Stanford AI Group</li>
                <li>• DeepMind Scholars</li>
              </ul>
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 7: Phase 3 - Research & Labs
    <Slide
      key={6}
      background="https://images.unsplash.com/photo-1635340038191-96eea7fbd056?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90aWNzJTIwbGFifGVufDF8fHx8MTc2MTEzNTM4OHww&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent alignment="right">
        <div className="flex flex-col gap-6">
          <Badge className="bg-blue-500 text-white px-4 py-2 w-fit">
            Phase 3: 2022-2023
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            Research Excellence
          </h1>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg border border-white/20 space-y-4">
            <h3 className="text-white text-3xl">
              State-of-the-Art Facilities
            </h3>
            <div className="text-white/90 text-xl space-y-3">
              <p>🤖 Advanced Robotics Lab</p>
              <p>🧠 Neural Interface Research Center</p>
              <p>🔬 Quantum Computing Lab</p>
              <p>👁️ Computer Vision Studio</p>
              <p>💬 Natural Language Processing Hub</p>
            </div>
            <p className="text-blue-200 text-2xl">
              15+ Research Publications in Top Journals
            </p>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 8: Phase 4 - Faculty
    <Slide
      key={7}
      background="https://images.unsplash.com/photo-1758270704113-9fb2ac81788f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjEwNTAxNzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent>
        <div className="flex flex-col gap-8 items-center">
          <Badge className="bg-orange-500 text-white px-4 py-2">
            Phase 4: 2023-2024
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl text-center">
            World-Class Faculty
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <div className="text-5xl mb-3">50+</div>
              <p className="text-white text-xl">
                PhD AI Researchers
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <div className="text-5xl mb-3">12</div>
              <p className="text-white text-xl">
                Industry Veterans
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <div className="text-5xl mb-3">8</div>
              <p className="text-white text-xl">
                Nobel/Turing Winners
              </p>
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 9: Student Success
    <Slide
      key={8}
      background="https://images.unsplash.com/photo-1569653402334-2e98fbaa80ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNvZGluZyUyMGNvbXB1dGVyc3xlbnwxfHx8fDE3NjExMzUzODl8MA&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent>
        <div className="flex flex-col gap-8">
          <Badge className="bg-pink-500 text-white px-4 py-2 w-fit mx-auto">
            Impact: Student Success
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl text-center">
            A New Generation
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-4">
              <h3 className="text-white text-3xl">
                Achievements
              </h3>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 space-y-3 text-white/90 text-lg">
                <p>🏆 3 International AI Competition Wins</p>
                <p>💼 98% Job Placement Rate</p>
                <p>🚀 25+ Student Startups Founded</p>
                <p>📚 500+ Research Papers Published</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-white text-3xl">
                Where They Work
              </h3>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 space-y-3 text-white/90 text-lg">
                <p>• Google DeepMind</p>
                <p>• Tesla AI Team</p>
                <p>• Microsoft Research</p>
                <p>• Meta AI Research</p>
                <p>• Leading AI Startups</p>
              </div>
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 10: Recognition
    <Slide
      key={9}
      background="linear-gradient(135deg, #7c2d12 0%, #431407 100%)"
    >
      <SlideContent>
        <div className="flex flex-col gap-8 items-center">
          <Badge className="bg-yellow-500 text-black px-4 py-2">
            Recognition & Awards
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl text-center">
            Global Recognition
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mt-6">
            <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/30 text-center">
              <div className="text-4xl mb-2">🥇</div>
              <p className="text-white">
                Top 10 AI College Worldwide
              </p>
              <p className="text-white/60 text-sm mt-2">
                QS Rankings 2025
              </p>
            </div>
            <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/30 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-white">
                Best Innovation in Education
              </p>
              <p className="text-white/60 text-sm mt-2">
                EdTech Awards
              </p>
            </div>
            <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/30 text-center">
              <div className="text-4xl mb-2">🎓</div>
              <p className="text-white">
                Excellence in AI Research
              </p>
              <p className="text-white/60 text-sm mt-2">
                IEEE Recognition
              </p>
            </div>
            <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 p-6 rounded-lg border border-yellow-500/30 text-center">
              <div className="text-4xl mb-2">🌍</div>
              <p className="text-white">
                Most Impactful College
              </p>
              <p className="text-white/60 text-sm mt-2">
                Global Education Forum
              </p>
            </div>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 11: The Future
    <Slide
      key={10}
      background="https://images.unsplash.com/photo-1563394867331-e687a36112fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY2xhc3Nyb29tJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjExNzE0M3ww&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent alignment="left">
        <div className="flex flex-col gap-6">
          <Badge className="bg-indigo-500 text-white px-4 py-2 w-fit">
            Vision 2030
          </Badge>
          <h1 className="text-white text-5xl md:text-7xl">
            The Future Ahead
          </h1>
          <div className="space-y-6 text-white/90 text-xl md:text-2xl">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <h3 className="text-white text-2xl mb-3">
                Our Next Goals
              </h3>
              <ul className="space-y-3">
                <li>🎯 #1 AI College Globally</li>
                <li>
                  🌐 Online AI Academy for 100,000+ Students
                </li>
                <li>🔬 Breakthrough AI Research Center</li>
                <li>🤝 Industry Partnerships Worldwide</li>
                <li>💡 Incubate 100+ AI Startups</li>
              </ul>
            </div>
            <p className="text-indigo-200 text-2xl md:text-3xl">
              We're not just teaching AI. We're shaping the
              future of humanity.
            </p>
          </div>
        </div>
      </SlideContent>
    </Slide>,

    // Slide 12: Call to Action
    <Slide
      key={11}
      background="https://images.unsplash.com/photo-1760348082205-8bda5fbdd7b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VsZWJyYXRpb24lMjBzdWNjZXNzfGVufDF8fHx8MTc2MTA4MTk5Mnww&ixlib=rb-4.1.0&q=80&w=1080"
      overlay
    >
      <SlideContent>
        <div className="flex flex-col gap-8 items-center">
          <h1 className="text-white text-6xl md:text-8xl text-center">
            Join Our Journey
          </h1>
          <h2 className="text-white/90 text-2xl md:text-4xl text-center max-w-4xl">
            Be part of the transformation. Shape the future of
            AI.
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <Button className="bg-white text-black hover:bg-white/90 px-8 py-6 text-xl">
              Apply Now
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-xl"
            >
              Learn More
            </Button>
          </div>
          <div className="mt-8 text-white/70 text-lg text-center">
            <p>
              From a 75-year heritage to the frontier of AI
              innovation
            </p>
            <p className="text-white text-2xl">
              This is our story. What's yours?
            </p>
          </div>
        </div>
      </SlideContent>
    </Slide>,
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {slides[currentSlide]}
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <Button
          onClick={prevSlide}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ),
          )}
        </div>

        <Button
          onClick={nextSlide}
          variant="outline"
          size="icon"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-md"
          disabled={currentSlide === totalSlides - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Slide Counter */}
      <div className="fixed top-8 right-8 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/30">
        {currentSlide + 1} / {totalSlides}
      </div>

      {/* Keyboard Hint */}
      <div className="fixed top-8 left-8 z-50 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/70 text-sm border border-white/30">
        Use ← → arrows or spacebar to navigate
      </div>
    </div>
  );
}