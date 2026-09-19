class BookPageScrapingError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function scrapeBookPage(sourceUrl) {
  let target;

  try {
    target = new URL(sourceUrl);
  } catch {
    throw new BookPageScrapingError("올바른 도서 URL이 아닙니다.", 400);
  }

  if (target.protocol !== "https:" || target.hostname !== "www.easyspub.co.kr") {
    throw new BookPageScrapingError("이지스퍼블리싱 도서 URL만 등록할 수 있습니다.", 400);
  }

  try {
    const headers = { "User-Agent": "easyspub-book-draw/1.0" };
    const firstResponse = await fetch(target, { headers });
    const cookies = typeof firstResponse.headers.getSetCookie === "function"
      ? firstResponse.headers.getSetCookie()
      : [firstResponse.headers.get("set-cookie")].filter(Boolean);
    const sessionCookie = cookies.map((cookie) => cookie.split(";", 1)[0]).join("; ");
    const response = sessionCookie
      ? await fetch(target, { headers: { ...headers, Cookie: sessionCookie } })
      : firstResponse;

    if (!response.ok) throw new Error(`upstream responded with ${response.status}`);
    return { html: await response.text() };
  } catch (error) {
    if (error instanceof BookPageScrapingError) throw error;
    throw new BookPageScrapingError("도서 페이지를 불러오지 못했습니다.", 502);
  }
}

export async function handler(event) {
  const sourceUrl = event.queryStringParameters?.url || "";

  try {
    return {
      statusCode: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(await scrapeBookPage(sourceUrl)),
    };
  } catch (error) {
    return {
      statusCode: error instanceof BookPageScrapingError ? error.status : 500,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "도서 페이지를 불러오지 못했습니다.",
      }),
    };
  }
}
