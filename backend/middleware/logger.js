const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url, ip } = req;
  process.stdout.write(`[${timestamp}] ${method} ${url} - IP: ${ip}\n`);
  next();
};
module.exports = logger;
