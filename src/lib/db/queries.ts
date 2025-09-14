import { prisma } from './prisma';
import {
  DrawStatus,
  TicketStatus,
  PaymentStatus,
  PayoutStatus,
  Prisma,
  AuditAction,
} from '@prisma/client';

// User queries
export async function findOrCreateUser(email?: string | null, walletAddress?: string, walletNetwork?: string) {
  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { wallets: true },
    });
    if (existingUser) return existingUser;
  }

  return prisma.user.create({
    data: {
      email,
      wallets: walletAddress && walletNetwork
        ? {
            create: {
              address: walletAddress,
              network: walletNetwork as any,
              isPrimary: true,
            },
          }
        : undefined,
    },
    include: { wallets: true },
  });
}

// Draw queries
export async function getActiveDraws() {
  return prisma.draw.findMany({
    where: {
      status: {
        in: [DrawStatus.UPCOMING, DrawStatus.ACTIVE],
      },
      scheduledAt: {
        gte: new Date(),
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function getCurrentDraw() {
  return prisma.draw.findFirst({
    where: {
      status: DrawStatus.ACTIVE,
    },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });
}

export async function getDrawWithTickets(drawId: string) {
  return prisma.draw.findUnique({
    where: { id: drawId },
    include: {
      tickets: {
        include: {
          user: true,
          wallet: true,
          payment: true,
        },
      },
    },
  });
}

// Ticket queries
export async function createTicket(data: {
  drawId: string;
  userId?: string;
  walletId: string;
  ticketNumber: string;
}) {
  return prisma.ticket.create({
    data: {
      ...data,
      status: TicketStatus.PENDING_PAYMENT,
    },
    include: {
      draw: true,
      wallet: true,
    },
  });
}

export async function getTicketsByUser(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    include: {
      draw: true,
      payment: true,
      payout: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { 
      status,
      purchasedAt: status === TicketStatus.ACTIVE ? new Date() : undefined,
    },
  });
}

// Payment queries
export async function createPayment(data: Prisma.PaymentCreateInput) {
  return prisma.payment.create({
    data,
    include: { ticket: true },
  });
}

export async function updatePaymentStatus(
  providerPaymentId: string,
  status: PaymentStatus,
  additionalData?: Partial<Prisma.PaymentUpdateInput>
) {
  return prisma.payment.update({
    where: { providerPaymentId },
    data: {
      status,
      ...additionalData,
      confirmedAt: status === PaymentStatus.CONFIRMED ? new Date() : undefined,
      failedAt: status === PaymentStatus.FAILED ? new Date() : undefined,
    },
    include: { ticket: true },
  });
}

export async function getPaymentByProviderId(providerPaymentId: string) {
  return prisma.payment.findUnique({
    where: { providerPaymentId },
    include: { ticket: true },
  });
}

// Payout queries
export async function createPayout(data: Prisma.PayoutCreateInput) {
  return prisma.payout.create({
    data,
    include: { ticket: true, wallet: true },
  });
}

export async function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
  transactionHash?: string
) {
  return prisma.payout.update({
    where: { id: payoutId },
    data: {
      status,
      transactionHash,
      completedAt: status === PayoutStatus.COMPLETED ? new Date() : undefined,
      failedAt: status === PayoutStatus.FAILED ? new Date() : undefined,
    },
  });
}

// Audit log queries
export async function createAuditLog(data: {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}) {
  return prisma.auditLog.create({
    data: {
      ...data,
      metadata: data.metadata ? data.metadata : undefined,
    },
  });
}

export async function getAuditLogs(filters?: {
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return prisma.auditLog.findMany({
    where: {
      action: filters?.action,
      entityType: filters?.entityType,
      entityId: filters?.entityId,
      userId: filters?.userId,
      timestamp: {
        gte: filters?.startDate,
        lte: filters?.endDate,
      },
    },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });
}

// System settings queries
export async function getSystemSetting(key: string) {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });
  return setting?.value;
}

export async function updateSystemSetting(key: string, value: any) {
  return prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// Stats queries
export async function getDrawStats(drawId: string) {
  const [ticketCount, totalRevenue, uniqueUsers] = await Promise.all([
    prisma.ticket.count({
      where: { drawId, status: TicketStatus.ACTIVE },
    }),
    prisma.payment.aggregate({
      where: {
        ticket: { drawId },
        status: PaymentStatus.CONFIRMED,
      },
      _sum: { amount: true },
    }),
    prisma.ticket.groupBy({
      by: ['userId'],
      where: { drawId, status: TicketStatus.ACTIVE, userId: { not: null } },
    }),
  ]);

  return {
    ticketsSold: ticketCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    uniqueUsers: uniqueUsers.length,
  };
}