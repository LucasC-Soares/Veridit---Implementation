export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER');

export interface MessageEnvelope<TPayload = unknown> {
  id: string;
  topic: string;
  correlationId: string;
  payload: TPayload;
}

export interface MessageBroker {
  publish<TPayload>(message: MessageEnvelope<TPayload>): Promise<void>;
  subscribe<TPayload>(
    topic: string,
    handler: (message: MessageEnvelope<TPayload>) => Promise<void>,
  ): Promise<void>;
}
