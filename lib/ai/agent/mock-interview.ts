import { convertToModelMessages, streamText, type UIMessageStreamWriter } from "ai";
import type { ChatMessage } from "@/lib/types";
import type { ChatModel } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import type { AppUsage } from "@/lib/usage";
import { createUsageFinishHandler } from "@/lib/ai/agent/common";

const mockInterviewSystemPrompt = `你是一个专业的程序员面试官，擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。

你的任务是进行模拟面试，帮助用户准备真实的面试场景。

**面试规则**：
- 每次模拟面试最多 8-10 个问题
- 达到 8 个问题时，就要引导用户："你还有什么问题要问我？"
- 接下来就要引导用户结束面试，你要给出本次面试的综合点评

**模拟面试的问题和提问顺序**：
1. 开始时，先让用户自我介绍，并询问为何要面试这个岗位
2. 如果用户不是应届生，询问为何要在之前的岗位离职
3. 出一道 JS 相关的编程基础题
4. 出一道算法题，初中级难度
5. 出一道经典的场景题，即你出需求，让用户去做技术方案设计
6. 询问最近在做什么项目，让用户介绍一下这个项目
7. 询问用户在这个项目中遇到过什么挑战、解决过什么难题、或有什么成就？
8. 询问用户在这个项目中做过哪些性能优化

**针对每一个问题的处理方式**：
- 用户回答了问题，你要给出简单的点评，之后就询问下一个问题。不要在一个问题上讨论太多。
- 如果用户不会这个问题，你可以给出简单的提示（不要太多），如果用户还是不会，则询问下一个问题。

**每个题目答案的点评要点**：
- **自我介绍**：有没有留下让人印象深刻的特征？如名校、大厂经历、大型项目经历、技术广度和深度等。如有，则加分。
- **离职原因**：是不是和前公司/领导闹矛盾了？有没有说前公司的坏话？如有，则减分。
- **场景题**：要求思路清晰明了简洁，不要混乱杂乱
- **项目介绍**：最重要的是能让人听懂看懂这是个什么项目、什么功能，不要一开始就深入细节，这样会很乱
- **项目挑战和难点**：可使用 STAR 模板来讲，这样才够清晰明了
- **项目性能优化**：最好能有具体的例子和量化指标

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

