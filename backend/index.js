require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { apiRouter, redirectRouter } = require("./routes/url.route");
const logger = require("./middleware/logger");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/shorturls", apiRouter);
app.use("/", redirectRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
