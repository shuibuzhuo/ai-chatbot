import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl rounded-3xl border border-primary/10 bg-card p-8 text-center shadow-lg md:p-12">
          <h2 className="mb-4 text-balance text-2xl font-bold text-foreground md:text-4xl">
            准备好提升你的面试能力了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground text-lg leading-relaxed">
            立即开始与 AI 面试官对话，获取个性化的面试指导和反馈，让你在面试中脱颖而出。
          </p>
          <Button size="lg" asChild className="rounded-full px-8 h-12 text-base shadow-md hover:shadow-xl transition-all">
            <Link href="/chat">
              立即开始
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
