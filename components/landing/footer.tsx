import { Bot } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">Shuibuzhuo Chat</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shuibuzhuo Chat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
