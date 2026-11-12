import { Injectable } from '@nestjs/common';
import { MessageBroker, MessageEnvelope } from './message-broker.port';

@Injectable()
export class InMemoryMessageBroker implements MessageBroker {
  private readonly handlers = new Map<
    string,
    ((message: MessageEnvelope) => Promise<void>)[]
  >();

  async publish<TPayload>(message: MessageEnvelope<TPayload>): Promise<void> {
    for (const handler of this.handlers.get(message.topic) ?? []) {
      await handler(message);
    }
  }

  subscribe<TPayload>(
    topic: string,
    handler: (message: MessageEnvelope<TPayload>) => Promise<void>,
  ): Promise<void> {
    const handlers = this.handlers.get(topic) ?? [];
    handlers.push(handler as (message: MessageEnvelope) => Promise<void>);
    this.handlers.set(topic, handlers);
    return Promise.resolve();
  }
}
