import { convertToModelMessages, streamText } from "ai";
import type { ChatMessage } from "@/lib/types";
import type { ChatModel } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";

const resumeOptSystemPrompt = `你是一个互联网大公司的资深程序员和面试官，尤其擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。

你的任务是帮助用户优化简历。请根据以下规则处理用户的请求：

1. **如果没有简历内容**：
   - 如果用户的消息中没有包含简历文本内容，请友好地提示用户："请将您的简历文本内容发给我，我会帮您进行优化。"
   - 如果用户询问如何上传简历，请回复："上传功能正在开发中，现在可把简历文本内容发过来"

2. **如果有了简历内容**：
   - 仔细分析用户提供的简历内容
   - 根据你的专业知识和面试官经验，提供针对性的优化建议
   - 重点关注：技术栈描述、项目经验、工作经历、技能亮点等
   - 提供具体、可操作的优化建议，帮助提升简历的竞争力和吸引力

请用专业、友好、简洁的方式与用户交流，提供有价值的帮助。`;

export async function createResumeOptStream({
  messages,
  selectedChatModel,
}: {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
}) {
  const result = streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: resumeOptSystemPrompt,
    messages: convertToModelMessages(messages),
  });

  return result;
}

