import "server-only";

import { getFirstChatId } from "@/lib/db/queries";

export async function POST() {
  try {
    const firstChatId = await getFirstChatId();
    if (!firstChatId) {
      return Response.json({ errno: -1 });
    }

    return Response.json({ errno: 0, data: { id: firstChatId } });
  } catch (error) {
    return Response.json({ errno: -1 });
  }
}
