import { Global, Module } from '@nestjs/common';
import { InMemoryMessageBroker } from './in-memory-message-broker';
import { MESSAGE_BROKER } from './message-broker.port';
import { RabbitMqMessageBroker } from './rabbitmq-message-broker';

@Global()
@Module({
  providers: [
    InMemoryMessageBroker,
    RabbitMqMessageBroker,
    {
      provide: MESSAGE_BROKER,
      useFactory: (
        inMemory: InMemoryMessageBroker,
        rabbit: RabbitMqMessageBroker,
      ) => (process.env.RABBITMQ_URL ? rabbit : inMemory),
      inject: [InMemoryMessageBroker, RabbitMqMessageBroker],
    },
  ],
  exports: [MESSAGE_BROKER],
})
export class MessagingModule {}
