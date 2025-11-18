import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventBus, events, type DomainEvent } from '../events';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clearAll();
  });

  it('should register and emit events', async () => {
    const handler = vi.fn();
    eventBus.on('suite.created', handler);

    await eventBus.publish('suite.created', { id: '123', name: 'Test Suite' });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'suite.created',
        data: { id: '123', name: 'Test Suite' },
      })
    );
  });

  it('should support multiple handlers for same event', async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    eventBus.on('run.completed', handler1);
    eventBus.on('run.completed', handler2);

    await eventBus.publish('run.completed', { runId: '123' });

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('should unregister handlers', async () => {
    const handler = vi.fn();

    eventBus.on('agent.created', handler);
    eventBus.off('agent.created', handler);

    await eventBus.publish('agent.created', { id: '123' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle async handlers', async () => {
    const results: string[] = [];

    eventBus.on('run.started', async (event) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      results.push('handler1');
    });

    eventBus.on('run.started', async (event) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      results.push('handler2');
    });

    await eventBus.publish('run.started', { runId: '123' });

    expect(results).toHaveLength(2);
    expect(results).toContain('handler1');
    expect(results).toContain('handler2');
  });

  it('should handle handler errors gracefully', async () => {
    const errorHandler = vi.fn(() => {
      throw new Error('Handler error');
    });
    const successHandler = vi.fn();

    eventBus.on('suite.deleted', errorHandler);
    eventBus.on('suite.deleted', successHandler);

    await expect(eventBus.publish('suite.deleted', { id: '123' })).resolves.not.toThrow();

    expect(errorHandler).toHaveBeenCalled();
    expect(successHandler).toHaveBeenCalled();
  });

  it('should include metadata in events', async () => {
    const handler = vi.fn();
    eventBus.on('cost.calculated', handler);

    await eventBus.publish(
      'cost.calculated',
      { runId: '123', cost: 1.50 },
      { source: 'test' }
    );

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { source: 'test' },
      })
    );
  });
});

describe('Event Publishers', () => {
  beforeEach(() => {
    eventBus.clearAll();
  });

  it('should provide typed event publishers', async () => {
    const handler = vi.fn();
    eventBus.on('suite.created', handler);

    await events.suite.created({ id: '123', name: 'Test Suite' });

    expect(handler).toHaveBeenCalledOnce();
  });

  it('should support all predefined events', async () => {
    const handlers = {
      'suite.created': vi.fn(),
      'suite.updated': vi.fn(),
      'agent.created': vi.fn(),
      'run.completed': vi.fn(),
      'result.scored': vi.fn(),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      eventBus.on(event as any, handler);
    });

    await events.suite.created({ id: '1' });
    await events.suite.updated({ id: '2' });
    await events.agent.created({ id: '3' });
    await events.run.completed({ runId: '4' });
    await events.result.scored({ resultId: '5' });

    Object.values(handlers).forEach((handler) => {
      expect(handler).toHaveBeenCalledOnce();
    });
  });
});
