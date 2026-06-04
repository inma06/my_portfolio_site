interface TrackPrdAgentEventInput {
  eventName: string;
  payload?: Record<string, unknown>;
}

export function trackPrdAgentEvent({
  eventName,
  payload = {},
}: TrackPrdAgentEventInput) {
  const body = JSON.stringify({
    eventName,
    payload: {
      ...payload,
      path: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      occurredAt: new Date().toISOString(),
    },
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const queued = navigator.sendBeacon("/.netlify/functions/track-prd-event", blob);
    if (queued) return;
  }

  void fetch("/.netlify/functions/track-prd-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Tracking must never block the main user flow.
  });
}

