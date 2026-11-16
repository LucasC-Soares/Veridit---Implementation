import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { creditPackages } from './schema';

const client = postgres(process.env.DATABASE_URL ?? '');
const db = drizzle(client);

async function seed(): Promise<void> {
  await db.insert(creditPackages).values([
    {
      name: 'Básico',
      credits: 10,
      pricePerCreditCents: 500,
      benefitsDescription: 'Pacote inicial para registros pontuais.',
    },
    {
      name: 'Médio',
      credits: 50,
      pricePerCreditCents: 400,
      benefitsDescription: 'Pacote para uso recorrente.',
    },
    {
      name: 'Premium',
      credits: 150,
      pricePerCreditCents: 300,
      benefitsDescription: 'Maior economia para uso intensivo.',
    },
  ]);
  console.log('Pacotes de créditos inseridos.');
  await client.end();
}

void seed().catch(async (error: unknown) => {
  console.error(error);
  await client.end();
  process.exitCode = 1;
});
