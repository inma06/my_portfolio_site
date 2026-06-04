import { createMockPrdAgentResponse } from "./prdAgentMock";
import type { PrdAgentRequest, PrdAgentResponse } from "../types/prdAgent";

const PRD_AGENT_ENDPOINT = "/.netlify/functions/prd-agent";

export async function requestPrdAgent(
  request: PrdAgentRequest,
): Promise<{ response: PrdAgentResponse; source: "netlify" | "mock" }> {
  try {
    const res = await fetch(PRD_AGENT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`PRD agent failed with ${res.status}`);
    }

    const response = (await res.json()) as PrdAgentResponse;
    return { response, source: "netlify" };
  } catch {
    return { response: createMockPrdAgentResponse(request), source: "mock" };
  }
}

