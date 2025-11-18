import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { logger, Logger } from '../logger';

describe('Logger', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;
  let consoleInfoSpy: any;
  let consoleDebugSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.clearContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log error messages', () => {
    logger.error('Test error message');

    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(logEntry.level).toBe('error');
    expect(logEntry.message).toBe('Test error message');
  });

  it('should log with context', () => {
    logger.info('Test message', { userId: '123', requestId: 'req-456' });

    expect(consoleInfoSpy).toHaveBeenCalledOnce();
    const logEntry = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logEntry.context).toEqual({ userId: '123', requestId: 'req-456' });
  });

  it('should log error objects with stack traces', () => {
    const error = new Error('Test error');
    logger.error('Something went wrong', error);

    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(logEntry.error).toBeDefined();
    expect(logEntry.error.message).toBe('Test error');
    expect(logEntry.error.stack).toBeDefined();
  });

  it('should support global context', () => {
    logger.setContext({ organizationId: 'org-123' });
    logger.info('Test message', { userId: 'user-456' });

    const logEntry = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logEntry.context).toEqual({
      organizationId: 'org-123',
      userId: 'user-456',
    });
  });

  it('should create child loggers with additional context', () => {
    const childLogger = logger.child({ requestId: 'req-789' });
    childLogger.info('Child log message');

    const logEntry = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logEntry.context).toEqual({ requestId: 'req-789' });
  });

  it('should respect log levels', () => {
    const testLogger = new Logger();
    process.env.LOG_LEVEL = 'warn';

    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    testLogger.debug('Debug message');
    testLogger.info('Info message');
    testLogger.warn('Warn message');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledOnce();

    delete process.env.LOG_LEVEL;
  });

  it('should include timestamp in log entries', () => {
    logger.info('Test message');

    const logEntry = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
    expect(logEntry.timestamp).toBeDefined();
    expect(new Date(logEntry.timestamp)).toBeInstanceOf(Date);
  });
});
