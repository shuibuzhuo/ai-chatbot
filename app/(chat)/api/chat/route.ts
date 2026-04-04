import { geolocation } from "@vercel/functions";
import { JsonToSseTransformStream } from "ai";
const { PDFParse } = require("pdf-parse");
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { auth, type UserType } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import { createChatStream } from "@/lib/ai/agent";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import type { ChatModel } from "@/lib/ai/models";
import type { RequestHints } from "@/lib/ai/prompts";
import {
  createStreamId,
  deleteChatById,
  getApiCallCountByUserId,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  recordApiCall,
  saveChat,
  saveMessages,
  updateChatLastContextById,
} from "@/lib/db/queries";
import type { DBMessage } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    console.log('error...', _)
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel["id"];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const apiCallCount = await getApiCallCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (
      apiCallCount >= entitlementsByUserType[userType].maxApiCallsPerDay
    ) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    // Extract base64 from file parts and create newMessage 
    let base64Value: string | undefined;
    const newParts = message.parts.map((part) => {
      if (
        part.type === "file" &&
        "base64" in part &&
        typeof part.base64 === "string"
      ) {
        base64Value = part.base64;
        // @ts-ignore Create a new text part 
        return { type: "text", text: `<${part.name as string}>` };
      }
      return part;
    });

    const newMessage: ChatMessage = {
      ...message,
      // @ts-ignore 
      parts: newParts,
    };

    console.log("base64 value:", base64Value);
    console.log("newMessage...", newMessage)
    if (base64Value) {
      const pdfBuffer = Buffer.from(base64Value, 'base64');
      const pdfUint8Array = new Uint8Array(pdfBuffer);
      console.log("pdfUint8Array...", pdfUint8Array)

      // 标记 PDF 解析是否失败
      let pdfParseFailed = false;
      // 使用 pdf-parse 提取文本内容
      try {
        const pdfParser = new PDFParse(pdfUint8Array);
        await pdfParser.load();
        const textContent = await pdfParser.getText();

        // 检查是否成功获取到文本内容
        if (!textContent || !textContent.text || textContent.text.trim().length === 0) {
          console.warn('PDF 文件解析失败：未获取到文本内容');
          pdfParseFailed = true;
        } else {
          console.log('PDF 文本内容:');
          console.log('='.repeat(50));
          console.log(textContent.text);
          console.log('='.repeat(50));
        }
      } catch (error) {
        console.error('解析 PDF 文件时出错:', error);
        pdfParseFailed = true;
      }
    }
    await recordApiCall({ userId: session.user.id });

    const chat = await getChatById({ id });
    let messagesFromDb: DBMessage[] = [];

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
      // Only fetch messages if chat already exists
      messagesFromDb = await getMessagesByChatId({ id });
    } else {
      const title = await generateTitleFromUserMessage({
        message: newMessage,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
      // New chat - no need to fetch messages, it's empty
    }

    const uiMessages = [...convertToUIMessages(messagesFromDb), newMessage];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: newMessage.id,
          role: "user",
          parts: newMessage.parts,
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = await createChatStream({
      messages: uiMessages,
      selectedChatModel,
      requestHints,
      session,
      onMessagesFinish: async (messages) => {
        await saveMessages({
          messages: messages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });
      },
      onUsageFinish: async (usage) => {
        try {
          await updateChatLastContextById({
            chatId: id,
            context: usage,
          });
        } catch (err) {
          console.warn("Unable to persist last usage for chat", id, err);
        }
      },
    });

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
