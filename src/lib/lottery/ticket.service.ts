import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

export class TicketService {
  static generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }
  
  static async getTicketByNumber(ticketNumber: string) {
    return prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        draw: true,
        user: true,
        wallet: true,
        payment: true,
        payout: true,
      },
    });
  }
  
  static async getUserTickets(userId: string, limit = 50) {
    return prisma.ticket.findMany({
      where: { userId },
      include: {
        draw: true,
        payment: true,
        payout: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
  
  static async getWinningTickets(limit = 10) {
    return prisma.ticket.findMany({
      where: { isWinner: true },
      include: {
        draw: true,
        user: true,
        wallet: true,
        payout: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
  
  static async getTicketStats() {
    const [totalTickets, activeTickets, totalWon] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'ACTIVE' } }),
      prisma.payout.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);
    
    return {
      totalTickets,
      activeTickets,
      totalWon: totalWon._sum.amount || 0,
    };
  }
}