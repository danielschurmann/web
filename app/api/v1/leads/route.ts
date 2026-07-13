import { NextResponse } from "next/server";
import { authenticateRequest, requireScope } from "@/lib/api-auth";
import { ApiDataError, listLeads } from "@/lib/api-data";

export async function GET(request: Request) {
  const actor = await authenticateRequest(request);
  if (!actor || !requireScope(actor, "leads:read")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await listLeads(actor);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiDataError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
