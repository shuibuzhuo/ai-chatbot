import {
  convertToModelMessages,
  smoothStream,
  stepCountIs,
  streamText,
  type LanguageModelUsage,
  type UIMessageStreamWriter,
} from "ai";
import { unstable_cache as cache } from "next/cache";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import type { Session } from "next-auth";
import type { ChatModel } from "@/lib/ai/models";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn(
        "TokenLens: catalog fetch failed, using default catalog",
        err
      );
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

export function createUsageFinishHandler({
  selectedChatModel,
  dataStream,
  onUsageUpdate,
}: {
  selectedChatModel: ChatModel["id"];
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate: (usage: AppUsage) => void;
}): (params: { usage: LanguageModelUsage }) => Promise<void> {
  return async ({ usage }) => {
    try {
      const providers = await getTokenlensCatalog();
      const modelId =
        myProvider.languageModel(selectedChatModel).modelId;
      if (!modelId) {
        const finalMergedUsage = usage;
        dataStream.write({
          type: "data-usage",
          data: finalMergedUsage,
        });
        onUsageUpdate(finalMergedUsage);
        return;
      }

      if (!providers) {
        const finalMergedUsage = usage;
        dataStream.write({
          type: "data-usage",
          data: finalMergedUsage,
        });
        onUsageUpdate(finalMergedUsage);
        return;
      }

      const summary = getUsage({ modelId, usage, providers });
      const finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;
      dataStream.write({ type: "data-usage", data: finalMergedUsage });
      onUsageUpdate(finalMergedUsage);
    } catch (err) {
      console.warn("TokenLens enrichment failed", err);
      const finalMergedUsage = usage;
      dataStream.write({ type: "data-usage", data: finalMergedUsage });
      onUsageUpdate(finalMergedUsage);
    }
  };
}

export function createDefaultStreamText({
  messages,
  selectedChatModel,
  requestHints,
  session,
  dataStream,
  onUsageUpdate,
}: {
  messages: ChatMessage[];
  selectedChatModel: ChatModel["id"];
  requestHints: RequestHints;
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  onUsageUpdate: (usage: AppUsage) => void;
}) {
  return streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: systemPrompt({ selectedChatModel, requestHints }),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    experimental_activeTools:
      selectedChatModel === "chat-model-reasoning"
        ? []
        : [
            // "getWeather",
            // "createDocument",
            // "updateDocument",
            // "requestSuggestions",
          ],
    experimental_transform: smoothStream({ chunking: "word" }),
    tools: {
      // getWeather,
      // createDocument: createDocument({ session, dataStream }),
      // updateDocument: updateDocument({ session, dataStream }),
      // requestSuggestions: requestSuggestions({
      //   session,
      //   dataStream,
      // }),
    },
    experimental_telemetry: {
      isEnabled: isProductionEnvironment,
      functionId: "stream-text",
    },
    onFinish: createUsageFinishHandler({
      selectedChatModel,
      dataStream,
      onUsageUpdate,
    }),
  });
}

