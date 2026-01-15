"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { LazyImage } from "../ui/lazy-image"

const demos = [
  {
    id: 1,
    title: "简历优化演示",
    description: "看 AI 如何分析并优化你的简历",
    gifUrl: "/images/1-resume-opt.gif",
  },
  {
    id: 2,
    title: "模拟面试演示",
    description: "体验真实的 AI 模拟面试流程",
    gifUrl: "/images/2-mock-interview.gif",
  },
  {
    id: 3,
    title: "题目解答演示",
    description: "观看 AI 如何解析前端面试题",
    gifUrl: "/images/3-q-a.gif",
  },
]

export function DemoShowcase() {
  const [activeDemo, setActiveDemo] = useState(demos[0])

  return (
    <section id="demo" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">功能演示</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">观看实际使用效果，了解 AI 面试官如何帮助你提升</p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo)}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
                  activeDemo.id === demo.id
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground border border-border"
                )}
              >
                {demo.title}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-lg ring-1 ring-primary/5">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                <span className="ml-4 text-xs font-medium text-muted-foreground/70 tracking-wide uppercase">{activeDemo.title}</span>
              </div>
            </div>
            <div className="relative aspect-video w-full bg-secondary/20">
              <LazyImage
                src={activeDemo.gifUrl}
                alt={activeDemo.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="border-t border-border px-6 py-4 bg-card">
              <p className="text-center text-sm text-muted-foreground">{activeDemo.description}</p>
            </div>
          </div>

          {/* Mobile: Stack all demos */}
          <div className="mt-8 grid gap-6 md:hidden">
            {demos
              .filter((d) => d.id !== activeDemo.id)
              .map((demo) => (
                <div
                  key={demo.id}
                  className="overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-sm"
                  onClick={() => setActiveDemo(demo)}
                >
                  <div className="relative aspect-video w-full bg-secondary/20">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={demo.gifUrl}
                      alt={demo.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground">{demo.title}</h3>
                    <p className="text-sm text-muted-foreground">{demo.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  )
}
