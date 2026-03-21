import axios from "axios";
async function proxyImage(req, res) {
  const { url, download, fmt = "jpg" } = req.query;

  if (!url) return res.status(400).json({ error: "Missing url param" });

  // Optional: restrict to trusted domains so the endpoint can't be abused
  const ALLOWED_HOSTS = [
    "delivery.eu1.bfl.ai",
    "delivery.bfl.ai",
    // add other AI image CDN hosts here
  ];
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid url" });
  }
  if (!ALLOWED_HOSTS.some(h => parsedUrl.hostname.endsWith(h))) {
    return res.status(403).json({ error: "Host not allowed" });
  }

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 15000,
      headers: {
        // Forward a neutral user-agent so the CDN doesn't reject the request
        "User-Agent": "Mozilla/5.0 (compatible; DecorGen/1.0)",
      },
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");

    if (download === "1") {
      const ext = fmt === "png" ? "png" : "jpg";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="decorgen-design.${ext}"`
      );
    }

    response.data.pipe(res);
  } catch (err) {
    console.error("Proxy image error:", err.message);
    res.status(502).json({ error: "Failed to fetch image" });
  }
}

export default proxyImage;