import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(process.env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname,req,res,responseTime",
        // messageFormat: "{msg} - {req.method} {req.url} {res.statusCode} ({responseTime}ms)",
        singleLine: true,
      },
    },
  }),
});

export default logger;
