// Domain Event System
// Provides a type-safe event bus for domain events

export type DomainEventType =
  | 'suite.created'
  | 'suite.updated'
  | 'suite.deleted'
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deleted'
  | 'run.created'
  | 'run.started'
  | 'run.completed'
  | 'run.failed'
  | 'run.cancelled'
  | 'result.scored'
  | 'webhook.triggered'
  | 'cost.calculated';

export interface DomainEvent<T = any> {
  type: DomainEventType;
  timestamp: Date;
  data: T;
  metadata?: Record<string, any>;
}

export type EventHandler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

class EventBus {
  private handlers: Map<DomainEventType, Set<EventHandler>> = new Map();

  /**
   * Register a handler for a specific event type
   */
  on<T = any>(eventType: DomainEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);
  }

  /**
   * Unregister a handler
   */
  off<T = any>(eventType: DomainEventType, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit<T = any>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }

    const promises = Array.from(handlers).map((handler) => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Create and emit an event
   */
  async publish<T = any>(
    type: DomainEventType,
    data: T,
    metadata?: Record<string, any>
  ): Promise<void> {
    const event: DomainEvent<T> = {
      type,
      timestamp: new Date(),
      data,
      metadata,
    };

    await this.emit(event);
  }

  /**
   * Get all registered event types
   */
  getEventTypes(): DomainEventType[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clearAll(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Helper function to create type-safe event publishers
export function createEventPublisher<T = any>(type: DomainEventType) {
  return (data: T, metadata?: Record<string, any>) => eventBus.publish(type, data, metadata);
}

// Predefined event publishers
export const events = {
  suite: {
    created: createEventPublisher('suite.created'),
    updated: createEventPublisher('suite.updated'),
    deleted: createEventPublisher('suite.deleted'),
  },
  agent: {
    created: createEventPublisher('agent.created'),
    updated: createEventPublisher('agent.updated'),
    deleted: createEventPublisher('agent.deleted'),
  },
  run: {
    created: createEventPublisher('run.created'),
    started: createEventPublisher('run.started'),
    completed: createEventPublisher('run.completed'),
    failed: createEventPublisher('run.failed'),
    cancelled: createEventPublisher('run.cancelled'),
  },
  result: {
    scored: createEventPublisher('result.scored'),
  },
  webhook: {
    triggered: createEventPublisher('webhook.triggered'),
  },
  cost: {
    calculated: createEventPublisher('cost.calculated'),
  },
};
