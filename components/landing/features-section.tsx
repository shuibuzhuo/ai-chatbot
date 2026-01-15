import { FileText, MessageSquare, Lightbulb, Code, Target, Zap } from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "简历优化",
    description: "AI 分析你的简历，提供专业的优化建议，突出技术亮点，提升面试邀约率。",
  },
  {
    icon: MessageSquare,
    title: "模拟面试",
    description: "真实还原面试场景，从自我介绍到技术深挖，全流程模拟助你从容应对。",
  },
  {
    icon: Lightbulb,
    title: "面试题解答",
    description: "海量前端面试题库，覆盖 JavaScript、React、Vue、工程化等核心领域。",
  },
  {
    icon: Code,
    title: "代码评审",
    description: "提交你的代码，获取专业的代码质量分析和最佳实践建议。",
  },
  {
    icon: Target,
    title: "针对性训练",
    description: "根据目标公司和职位，定制专属的面试准备方案和重点知识点。",
  },
  {
    icon: Zap,
    title: "即时反馈",
    description: "每次回答后获得即时评分和改进建议，快速提升面试表现。",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">全方位面试准备</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">从简历到面试，从基础到进阶，覆盖你求职路上的每一个环节</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-primary/10 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
