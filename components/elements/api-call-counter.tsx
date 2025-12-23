"use client";

import type { ComponentProps } from "react";
import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

export type ApiCallCounterProps = ComponentProps<"span"> & {
  status?: UseChatHelpers<ChatMessage>["status"];
};

type UsageData = {
  count: number;
  max: number;
};

export const ApiCallCounter = ({ className, status, ...props }: ApiCallCounterProps) => {
  const { data: session } = useSession();
  const { mutate } = useSWRConfig();
  
  const { data, error, isLoading } = useSWR<UsageData>(
    session?.user ? "/api/chat/usage" : null,
    fetcher,
    {
      refreshInterval: 0, // 不自动轮询，通过 mutate 手动刷新
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 当 status 为 submitted 时刷新 API 调用次数
  useEffect(() => {
    console.log('[ApiCallCounter.tsx] status...', status);
    if (status === "submitted") {
      mutate("/api/chat/usage");
    }
  }, [status, mutate]);

  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap text-xs text-muted-foreground",
          className
        )}
        {...props}
      >
        —
      </span>
    );
  }

  if (error || !data) {
    return (
      <span
        className={cn(
          "inline-flex items-center whitespace-nowrap text-xs text-muted-foreground",
          className
        )}
        {...props}
      >
        —
      </span>
    );
  }

  const { count, max } = data;
  const isNearLimit = count >= max * 0.8; // 接近上限时显示警告样式

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap text-xs",
        isNearLimit
          ? "text-destructive font-medium"
          : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {count} / {max}
    </span>
  );
};

