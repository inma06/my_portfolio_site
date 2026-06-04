function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function normalizePayload(event, rawBody) {
  const parsed = JSON.parse(rawBody || "{}");
  const headers = event.headers || {};

  return {
    eventName: parsed.eventName || "unknown_event",
    payload: parsed.payload || {},
    ip:
      headers["x-nf-client-connection-ip"] ||
      headers["client-ip"] ||
      headers["x-forwarded-for"] ||
      "",
    country: headers["x-country"] || "",
    netlifyRequestId: headers["x-nf-request-id"] || "",
  };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return jsonResponse(200, {
      ok: true,
      skipped: true,
      reason: "GOOGLE_SHEETS_WEBHOOK_URL is not configured",
    });
  }

  try {
    const payload = normalizePayload(event, event.body);
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Sheets webhook failed: ${response.status} ${text}`);
    }

    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, {
      ok: false,
      error: "Failed to track event",
    });
  }
}

