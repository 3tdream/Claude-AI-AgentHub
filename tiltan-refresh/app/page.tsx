import Hero from "@/components/sections/Hero";
import Programs from "@/components/sections/Programs";
import About from "@/components/sections/About";
import Gallery from "@/components/sections/Gallery";
import Contact from "@/components/sections/Contact";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      <Hero />
      <Programs />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
