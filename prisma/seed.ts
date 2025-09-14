import { PrismaClient, DrawStatus, WalletNetwork } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateServerSeed(): { seed: string; hash: string } {
  const seed = crypto.randomBytes(32).toString('hex');
  const seedHash = crypto.createHash('sha256').update(seed).digest('hex');
  return { seed, hash: seedHash };
}

function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TKT-${timestamp}-${random}`;
}

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.auditLog.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  await prisma.systemSetting.createMany({
    data: [
      { key: 'maintenance_mode', value: false },
      { key: 'min_ticket_price', value: { amount: 1, currency: 'USDC' } },
      { key: 'max_tickets_per_user', value: 100 },
      { key: 'platform_fee_percentage', value: 5 },
      { key: 'min_confirmations', value: { BTC: 3, ETH: 12, USDC: 12 } },
    ],
  });

  const demoUser1 = await prisma.user.create({
    data: {
      email: 'demo1@example.com',
      emailVerified: true,
      wallets: {
        create: [
          {
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
            network: WalletNetwork.ETHEREUM,
            isPrimary: true,
          },
          {
            address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            network: WalletNetwork.BITCOIN,
            isPrimary: false,
          },
        ],
      },
    },
    include: { wallets: true },
  });

  const demoUser2 = await prisma.user.create({
    data: {
      email: 'demo2@example.com',
      emailVerified: true,
      wallets: {
        create: {
          address: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
          network: WalletNetwork.ETHEREUM,
          isPrimary: true,
        },
      },
    },
    include: { wallets: true },
  });

  const anonUser = await prisma.user.create({
    data: {
      wallets: {
        create: {
          address: '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
          network: WalletNetwork.ETHEREUM,
          isPrimary: true,
        },
      },
    },
    include: { wallets: true },
  });

  const upcomingDraw = await prisma.draw.create({
    data: {
      title: 'Weekly Mega Draw #1',
      description: 'Our first weekly mega draw with a guaranteed prize pool!',
      ticketPrice: 10,
      currency: 'USDC',
      maxTickets: 1000,
      status: DrawStatus.UPCOMING,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      serverSeedHash: generateServerSeed().hash,
    },
  });

  const activeDraw = await prisma.draw.create({
    data: {
      title: 'Daily Quick Draw #42',
      description: 'Daily draw with instant results!',
      ticketPrice: 1,
      currency: 'USDC',
      maxTickets: 100,
      status: DrawStatus.ACTIVE,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      serverSeedHash: generateServerSeed().hash,
    },
  });

  const { seed, hash } = generateServerSeed();
  const completedDraw = await prisma.draw.create({
    data: {
      title: 'Previous Weekly Draw #0',
      description: 'The inaugural draw',
      ticketPrice: 5,
      currency: 'USDC',
      maxTickets: 500,
      status: DrawStatus.COMPLETED,
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000),
      serverSeed: seed,
      serverSeedHash: hash,
      blockchainAnchor: '0000000000000000000635e8ac1e8d1e7e0e01e5b7d1e8e7a3d8f7c8e9d1e2',
      blockHeight: 820000,
      totalPrizePool: 2500,
      winnerSelection: JSON.stringify({
        method: 'sha256_modulo',
        inputs: { serverSeed: seed, blockHash: '0000000000000000000635e8ac1e8d1e7e0e01e5b7d1e8e7a3d8f7c8e9d1e2' },
        result: { winnerIndex: 42, ticketNumber: 'TKT-DEMO-WINNER' },
      }),
    },
  });

  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: generateTicketNumber(),
      drawId: activeDraw.id,
      userId: demoUser1.id,
      walletId: demoUser1.wallets[0].id,
      status: 'ACTIVE',
      purchasedAt: new Date(),
      payment: {
        create: {
          provider: 'COINBASE_COMMERCE',
          providerPaymentId: `charge_${crypto.randomBytes(16).toString('hex')}`,
          amount: 1,
          currency: 'USDC',
          cryptoAmount: 1,
          cryptoCurrency: 'USDC',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockConfirmations: 12,
        },
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: generateTicketNumber(),
      drawId: activeDraw.id,
      userId: demoUser2.id,
      walletId: demoUser2.wallets[0].id,
      status: 'ACTIVE',
      purchasedAt: new Date(),
      payment: {
        create: {
          provider: 'COINBASE_COMMERCE',
          providerPaymentId: `charge_${crypto.randomBytes(16).toString('hex')}`,
          amount: 1,
          currency: 'USDC',
          cryptoAmount: 1,
          cryptoCurrency: 'USDC',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockConfirmations: 12,
        },
      },
    },
  });

  const winningTicket = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-DEMO-WINNER',
      drawId: completedDraw.id,
      userId: demoUser1.id,
      walletId: demoUser1.wallets[0].id,
      status: 'WON',
      isWinner: true,
      purchasedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      payment: {
        create: {
          provider: 'COINBASE_COMMERCE',
          providerPaymentId: `charge_${crypto.randomBytes(16).toString('hex')}`,
          amount: 5,
          currency: 'USDC',
          cryptoAmount: 5,
          cryptoCurrency: 'USDC',
          status: 'CONFIRMED',
          confirmedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
          blockConfirmations: 100,
        },
      },
      payout: {
        create: {
          walletId: demoUser1.wallets[0].id,
          amount: 2375, // 2500 - 5% platform fee
          currency: 'USDC',
          cryptoAmount: 2375,
          cryptoCurrency: 'USDC',
          status: 'COMPLETED',
          transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
          processedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  await prisma.auditLog.createMany({
    data: [
      { action: 'DRAW_CREATED', entityType: 'Draw', entityId: upcomingDraw.id, metadata: { title: upcomingDraw.title } },
      { action: 'DRAW_CREATED', entityType: 'Draw', entityId: activeDraw.id, metadata: { title: activeDraw.title } },
      { action: 'TICKET_CREATED', entityType: 'Ticket', entityId: ticket1.id, userId: demoUser1.id, metadata: { ticketNumber: ticket1.ticketNumber } },
      { action: 'PAYMENT_RECEIVED', entityType: 'Ticket', entityId: ticket1.id, userId: demoUser1.id, metadata: { amount: 1, currency: 'USDC' } },
      { action: 'DRAW_COMPLETED', entityType: 'Draw', entityId: completedDraw.id, metadata: { winnerTicket: 'TKT-DEMO-WINNER' } },
      { action: 'PAYOUT_COMPLETED', entityType: 'Ticket', entityId: winningTicket.id, userId: demoUser1.id, metadata: { amount: 2375, currency: 'USDC' } },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });