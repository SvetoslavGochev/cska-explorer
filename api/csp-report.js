export default async function handler(req, res) {
  const method = req.method || "GET";

  if (method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (method === "GET") {
    res.status(200).json({ ok: true, endpoint: "csp-report" });
    return;
  }

  if (method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const payload = Array.isArray(body) ? body : [body];

    const normalized = payload.slice(0, 10).map((entry) => {
      const csp = entry?.["csp-report"] || entry?.body || entry || {};
      return {
        blockedUri: csp["blocked-uri"] || csp.blockedURL || null,
        documentUri: csp["document-uri"] || csp.url || null,
        violatedDirective: csp["violated-directive"] || csp.effectiveDirective || null,
        effectiveDirective: csp["effective-directive"] || csp.effectiveDirective || null,
        sourceFile: csp["source-file"] || null,
        lineNumber: csp["line-number"] || null,
        disposition: csp.disposition || null,
      };
    });

    console.log("[csp-report]", JSON.stringify({ count: payload.length, sample: normalized }));
    res.status(204).end();
  } catch (error) {
    console.error("[csp-report:error]", error);
    res.status(400).json({ error: "Invalid report payload" });
  }
}
