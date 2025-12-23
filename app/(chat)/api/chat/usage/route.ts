import { auth } from "@/app/(auth)/auth";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { getApiCallCountByUserId } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const apiCallCount = await getApiCallCountByUserId({
    id: session.user.id,
    differenceInHours: 24,
  });

  const maxCalls =
    entitlementsByUserType[session.user.type].maxApiCallsPerDay;

  return Response.json({ count: apiCallCount, max: maxCalls });
}

