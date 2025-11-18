// Notification Provider Adapter Interface
// Allows pluggable notification channels

export interface NotificationContext {
  recipientId?: string;
  recipientEmail?: string;
  templateId?: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export abstract class INotificationProvider {
  abstract name: string;

  /**
   * Send a notification
   */
  abstract send(context: NotificationContext): Promise<NotificationResult>;

  /**
   * Validate configuration
   */
  abstract validateConfig(config: any): boolean;

  /**
   * Health check
   */
  abstract healthCheck(): Promise<boolean>;
}

// No-op provider for testing
export class NoOpNotificationProvider extends INotificationProvider {
  name = 'noop';

  async send(context: NotificationContext): Promise<NotificationResult> {
    console.log('[NOTIFICATION]', context);
    return {
      success: true,
      messageId: `noop-${Date.now()}`,
    };
  }

  validateConfig(config: any): boolean {
    return true;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

// Webhook notification provider
export class WebhookNotificationProvider extends INotificationProvider {
  name = 'webhook';
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    super();
    this.webhookUrl = webhookUrl;
  }

  async send(context: NotificationContext): Promise<NotificationResult> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  validateConfig(config: any): boolean {
    return Boolean(config.webhookUrl);
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Registry
class NotificationProviderRegistry {
  private providers: Map<string, INotificationProvider> = new Map();

  constructor() {
    this.register(new NoOpNotificationProvider());
  }

  register(provider: INotificationProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): INotificationProvider | undefined {
    return this.providers.get(name);
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }
}

export const notificationProviderRegistry = new NotificationProviderRegistry();
