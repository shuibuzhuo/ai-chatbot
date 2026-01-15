import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { DemoShowcase } from "@/components/landing/demo-showcase"
import { CTASection } from "@/components/landing/cta-section"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased selection:bg-primary/10 selection:text-primary">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <DemoShowcase />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
