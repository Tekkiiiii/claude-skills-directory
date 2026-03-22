type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL as LogLevel] ?? LOG_LEVELS['info'];

function format(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (currentLevel <= LOG_LEVELS['debug']) format('debug', msg, meta);
  },
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (currentLevel <= LOG_LEVELS['info']) format('info', msg, meta);
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (currentLevel <= LOG_LEVELS['warn']) format('warn', msg, meta);
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    if (currentLevel <= LOG_LEVELS['error']) format('error', msg, meta);
  },
};
