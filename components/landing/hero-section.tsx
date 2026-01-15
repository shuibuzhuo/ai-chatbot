import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5 text-sm shadow-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">AI 驱动的面试准备工具</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            你的 AI 智能
            <span className="text-primary ml-2">面试官</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl leading-relaxed">
            专注前端开发领域，提供简历优化、模拟面试、面试题解答等全方位服务，帮助你从容应对每一次面试挑战。
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="w-full rounded-full px-8 sm:w-auto h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/chat">
                开始对话
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full rounded-full px-8 sm:w-auto h-12 text-base bg-transparent border-primary/20 hover:bg-primary/5">
              <Link href="#demo">查看演示</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: "10K+", label: "用户使用" },
              { value: "50K+", label: "模拟面试" },
              { value: "98%", label: "满意度" },
              { value: "500+", label: "面试题库" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-primary/10 bg-card/50 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="text-2xl font-bold text-primary md:text-3xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
