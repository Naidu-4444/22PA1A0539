const Url = require("../models/url.model");
const { nanoid } = require("nanoid");

exports.createShortUrl = async (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    let code = shortcode;
    if (code) {
      const existing = await Url.findOne({ shortCode: code });
      if (existing) {
        return res.status(409).json({ error: "Shortcode is already in use" });
      }
    } else {
      code = nanoid(7);
    }

    const validityMinutes = validity || 30;
    const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);

    const newUrl = new Url({
      originalUrl: url,
      shortCode: code,
      expiresAt: expiresAt,
    });
    await newUrl.save();

    const shortLink = `${req.protocol}://${req.get("host")}/${code}`;
    res.status(201).json({
      shortLink,
      expiry: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

exports.redirectToOriginalUrl = async (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const urlEntry = await Url.findOne({ shortCode: shortcode });

    if (!urlEntry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    if (new Date() > urlEntry.expiresAt) {
      return res.status(410).json({ error: "Short URL has expired" });
    }

    urlEntry.clicks.push({
      ipAddress: req.ip,
      referrer: req.headers.referer || "Direct",
    });
    await urlEntry.save();

    return res.redirect(urlEntry.originalUrl);
  } catch (error) {
    next(error);
  }
};

exports.getShortUrlStats = async (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const urlEntry = await Url.findOne({ shortCode: shortcode });

    if (!urlEntry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.status(200).json({
      originalUrl: urlEntry.originalUrl,
      createdAt: urlEntry.createdAt,
      expiresAt: urlEntry.expiresAt,
      totalClicks: urlEntry.clicks.length,
      clickDetails: urlEntry.clicks,
    });
  } catch (error) {
    next(error);
  }
};
