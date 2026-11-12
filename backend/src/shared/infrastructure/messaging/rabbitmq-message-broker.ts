import { Injectable } from '@nestjs/common';
import amqp, { Channel, ChannelModel } from 'amqplib';
import { MessageBroker, MessageEnvelope } from './message-broker.port';

@Injectable()
export class RabbitMqMessageBroker implements MessageBroker {
  private connection?: ChannelModel;
  private channel?: Channel;

  async publish<TPayload>(message: MessageEnvelope<TPayload>): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertExchange('veridit.events', 'topic', { durable: true });
    channel.publish(
      'veridit.events',
      message.topic,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: message.id,
        correlationId: message.correlationId,
      },
    );
  }

  async subscribe<TPayload>(
    topic: string,
    handler: (message: MessageEnvelope<TPayload>) => Promise<void>,
  ): Promise<void> {
    const channel = await this.getChannel();
    await channel.assertExchange('veridit.events', 'topic', { durable: true });
    const queue = await channel.assertQueue(`veridit.${topic}`, {
      durable: true,
      deadLetterExchange: 'veridit.dlx',
    });
    await channel.bindQueue(queue.queue, 'veridit.events', topic);
    await channel.consume(queue.queue, (raw) => {
      if (!raw) return;
      void handler(
        JSON.parse(raw.content.toString()) as MessageEnvelope<TPayload>,
      )
        .then(() => {
          channel.ack(raw);
        })
        .catch(() => {
          channel.nack(raw, false, false);
        });
    });
  }

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    const url = process.env.RABBITMQ_URL;
    if (!url) throw new Error('RABBITMQ_URL não configurada.');
    const connection = await amqp.connect(url);
    this.connection = connection;
    this.channel = await connection.createChannel();
    return this.channel;
  }
}
