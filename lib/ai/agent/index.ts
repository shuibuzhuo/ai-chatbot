import { createUIMessageStream } from "ai";
import type { Session } from "next-auth";
import type { ChatModel } from "@/lib/ai/models";
import { type RequestHints } from "@/lib/ai/prompts";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { generateUUID } from "@/lib/utils";
import { classifyUserMessage } from "@/lib/ai/agent/classify";
import { createResumeOptStream } from "@/lib/ai/agent/resume-opt";
import { createMockInterviewStream } from "@/lib/ai/agent/mock-interview";
import { createDefaultStreamText } from "@/lib/ai/agent/common";

export async function createChatStream({
  messages,
  selectedChatModel,
  requestHints,
  session,
  onMessagesFinish,
  onUsageFinish,
}: {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
  requestHints: RequestHints;
  session: Session;
  onMessagesFinish: (messages: ChatMessage[]) => Promise<void>;
  onUsageFinish: (usage: AppUsage) => Promise<void>;
}) {
  let finalMergedUsage: AppUsage | undefined;

  const stream = createUIMessageStream<ChatMessage>({
    execute: async ({ writer: dataStream }) => {
      // 分类用户消息
      const classification = await classifyUserMessage(messages);

      // 根据分类结果创建不同的 result
      let result;
      if (classification.resume_opt) {
        // 简历优化流程
        result = await createResumeOptStream({
          messages,
          selectedChatModel,
          dataStream,
          onUsageUpdate: (usage) => {
            finalMergedUsage = usage;
          },
        });
      } else if (classification.mock_interview) {
        // 模拟面试流程
        result = await createMockInterviewStream({
          messages,
          selectedChatModel,
          dataStream,
          onUsageUpdate: (usage) => {
            finalMergedUsage = usage;
          },
        });
      } else {
        // 默认流程
        result = createDefaultStreamText({
          messages,
          selectedChatModel,
          requestHints,
          session,
          dataStream,
          onUsageUpdate: (usage) => {
            finalMergedUsage = usage;
          },
        });
      }

      // 统一处理 result
      result.consumeStream();
      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
        })
      );
    },
    generateId: generateUUID,
    onFinish: async ({ messages }) => {
      await onMessagesFinish(messages);

      if (finalMergedUsage) {
        await onUsageFinish(finalMergedUsage);
      }
    },
    onError: () => {
      return "Oops, an error occurred!";
    },
  });

  return stream;
}

