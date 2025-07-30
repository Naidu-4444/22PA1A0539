const express = require("express");
const {
  createShortUrl,
  redirectToOriginalUrl,
  getShortUrlStats,
} = require("../controllers/url.controller");

const apiRouter = express.Router();
const redirectRouter = express.Router();

apiRouter.post("/", createShortUrl);
apiRouter.get("/:shortcode", getShortUrlStats);

redirectRouter.get("/:shortcode", redirectToOriginalUrl);

module.exports = { apiRouter, redirectRouter };
