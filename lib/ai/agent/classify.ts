import { generateObject, convertToModelMessages } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";
import { myProvider } from "@/lib/ai/providers";

const classificationSchema = z.object({
  resume_opt: z.boolean().describe("简历优化"),
  mock_interview: z.boolean().describe("模拟面试"),
  related_topics: z.boolean().describe("和编程、面试、简历相关的话题"),
  others: z.boolean().describe("其他话题"),
});

export type ClassificationResult = z.infer<typeof classificationSchema>;

const SYSTEM_PROMPT = `你是一个互联网大公司的资深程序员和面试官，尤其擅长前端技术栈，包括 HTML、CSS、JavaScript、TypeScript、React、Vue、Node.js、小程序等技术。请根据用户输入的内容，判断用户属于哪一种情况？按说明输出 JSON 格式。

输出的结构和语义如下：
{
  resume_opt  —— 简历优化,
  mock_interview —— 模拟面试
  related_topics —— 和编程、面试、简历相关的话题
  others —— 其他话题
}`;

export async function classifyUserMessage(
  messages: ChatMessage[]
): Promise<ClassificationResult> {
  // 如果消息为空，返回默认值
  if (messages.length === 0) {
    return {
      resume_opt: false,
      mock_interview: false,
      related_topics: false,
      others: true,
    };
  }

  try {
    // 使用 generateObject 进行分类
    const result = await generateObject({
      model: myProvider.languageModel("chat-model"),
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      schema: classificationSchema,
    });

    return result.object;
  } catch (error) {
    // 如果生成失败，返回默认值
    console.error("Failed to classify user message:", error);
    return {
      resume_opt: false,
      mock_interview: false,
      related_topics: false,
      others: true,
    };
  }
}

