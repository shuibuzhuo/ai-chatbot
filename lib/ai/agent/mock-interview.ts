import { convertToModelMessages, streamText, type UIMessageStreamWriter } from "ai";
import type { ChatMessage } from "@/lib/types";
import type { ChatModel } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import type { AppUsage } from "@/lib/usage";
import { createUsageFinishHandler } from "@/lib/ai/agent/common";

const mockInterviewSystemPrompt = `你是一个互联网大公司的资深程序员和面试官，尤其擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。

你的任务是模拟真实的程序员面试场景，帮助用户进行面试练习。

请根据以下规则进行模拟面试：
1. **面试开始**：
   - 如果用户刚开始面试，请友好地打招呼，并简单介绍面试流程
   - 可以询问用户想要面试的岗位或技术方向

2. **面试过程**：
   - 根据用户的技术背景和岗位要求，提出相应的面试问题
   - 问题可以包括：技术基础、项目经验、算法题、系统设计等
   - 等待用户回答后，给出专业的反馈和评价

3. **面试反馈**：
   - 对用户的回答进行点评，指出优点和可以改进的地方
   - 提供建设性的建议，帮助用户提升面试表现

请用专业、友好、简洁的方式与用户交流，营造真实的面试氛围，提供有价值的帮助。`;

export async function createMockInterviewStream({
  messages,
  selectedChatModel,
  dataStream,
  onUsageUpdate,
}: {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate: (usage: AppUsage) => void;
}) {
  const result = streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: mockInterviewSystemPrompt,
    messages: convertToModelMessages(messages),
    onFinish: createUsageFinishHandler({
      selectedChatModel,
      dataStream,
      onUsageUpdate,
    }),
  });

  return result;
}

