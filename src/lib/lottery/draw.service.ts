import { prisma } from '@/lib/db/prisma';
import { DrawStatus, TicketStatus } from '@prisma/client';
import { FairnessCalculator } from './fairness';
import { getAnchorProvider } from './anchor-provider';
import { createAuditLog } from '@/lib/db/queries';

export class DrawService {
  /**
   * Create a new draw with server seed commitment
   */
  static async createDraw(data: {
    title: string;
    description?: string;
    ticketPrice: number;
    currency: string;
    maxTickets: number;
    scheduledAt: Date;
  }) {
    // Generate server seed and hash for commitment
    const serverSeed = FairnessCalculator.generateServerSeed();
    const serverSeedHash = FairnessCalculator.hashServerSeed(serverSeed);
    
    const draw = await prisma.draw.create({
      data: {
        ...data,
        status: DrawStatus.UPCOMING,
        serverSeed, // Store privately
        serverSeedHash, // Publish publicly
      },
    });
    
    await createAuditLog({
      action: 'DRAW_CREATED',
      entityType: 'Draw',
      entityId: draw.id,
      metadata: {
        title: draw.title,
        scheduledAt: draw.scheduledAt,
        serverSeedHash,
      },
    });
    
    return draw;
  }
  
  /**
   * Start a draw (transition from UPCOMING to ACTIVE)
   */
  static async startDraw(drawId: string) {
    const draw = await prisma.draw.update({
      where: { id: drawId },
      data: {
        status: DrawStatus.ACTIVE,
        startedAt: new Date(),
      },
    });
    
    await createAuditLog({
      action: 'DRAW_STARTED',
      entityType: 'Draw',
      entityId: draw.id,
      metadata: {
        title: draw.title,
      },
    });
    
    return draw;
  }
  
  /**
   * Run the draw and select winner
   */
  static async runDraw(drawId: string, manualAnchor?: string) {
    const draw = await prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        tickets: {
          where: { status: TicketStatus.ACTIVE },
          orderBy: { createdAt: 'asc' },
          include: {
            user: true,
            wallet: true,
          },
        },
      },
    });
    
    if (!draw) {
      throw new Error('Draw not found');
    }
    
    if (draw.status === DrawStatus.COMPLETED) {
      throw new Error('Draw already completed');
    }
    
    if (draw.tickets.length === 0) {
      throw new Error('No tickets sold for this draw');
    }
    
    // Update status to DRAWING
    await prisma.draw.update({
      where: { id: drawId },
      data: { status: DrawStatus.DRAWING },
    });
    
    try {
      // Get blockchain anchor
      let blockchainAnchor: string;
      let blockHeight: number;
      
      if (manualAnchor) {
        // Use manually provided anchor (for testing)
        blockchainAnchor = manualAnchor;
        blockHeight = 0;
      } else {
        // Fetch real blockchain anchor
        const anchorProvider = getAnchorProvider('bitcoin');
        const anchor = await anchorProvider.getLatestAnchor();
        blockchainAnchor = anchor.blockHash;
        blockHeight = anchor.blockHeight;
      }
      
      // Calculate winner using fairness algorithm
      const fairnessProof = FairnessCalculator.calculateWinner(
        draw.serverSeed!,
        blockchainAnchor,
        draw.tickets.length
      );
      
      // Get winning ticket
      const winningTicket = draw.tickets[fairnessProof.winnerIndex];
      
      // Update draw with results
      await prisma.draw.update({
        where: { id: drawId },
        data: {
          status: DrawStatus.COMPLETED,
          completedAt: new Date(),
          blockchainAnchor,
          blockHeight,
          winnerSelection: JSON.stringify(fairnessProof),
        },
      });
      
      // Mark winning ticket
      await prisma.ticket.update({
        where: { id: winningTicket.id },
        data: {
          status: TicketStatus.WON,
          isWinner: true,
        },
      });
      
      // Mark other tickets as lost
      await prisma.ticket.updateMany({
        where: {
          drawId,
          id: { not: winningTicket.id },
          status: TicketStatus.ACTIVE,
        },
        data: {
          status: TicketStatus.LOST,
        },
      });
      
      // Calculate payout amount (minus platform fee)
      const platformFeePercent = 5; // 5% platform fee
      const totalPrizePool = Number(draw.totalPrizePool);
      const platformFee = totalPrizePool * (platformFeePercent / 100);
      const payoutAmount = totalPrizePool - platformFee;
      
      // Create payout record
      const payout = await prisma.payout.create({
        data: {
          ticketId: winningTicket.id,
          walletId: winningTicket.wallet.id,
          amount: payoutAmount,
          currency: draw.currency,
          status: 'PENDING',
          metadata: {
            drawId,
            totalPrizePool,
            platformFee,
            fairnessProof: JSON.parse(JSON.stringify(fairnessProof)),
          },
        },
      });
      
      await createAuditLog({
        action: 'DRAW_COMPLETED',
        entityType: 'Draw',
        entityId: draw.id,
        metadata: {
          winner: {
            ticketId: winningTicket.id,
            ticketNumber: winningTicket.ticketNumber,
            userId: winningTicket.userId,
            walletAddress: winningTicket.wallet.address,
          },
          fairnessProof: {
            serverSeedHash: fairnessProof.serverSeedHash,
            blockchainAnchor: fairnessProof.blockchainAnchor,
            winnerIndex: fairnessProof.winnerIndex,
          },
          payout: {
            id: payout.id,
            amount: payoutAmount,
            currency: draw.currency,
          },
        },
      });
      
      return {
        draw,
        winner: winningTicket,
        fairnessProof,
        payout,
      };
      
    } catch (error) {
      // Revert to ACTIVE status on error
      await prisma.draw.update({
        where: { id: drawId },
        data: { status: DrawStatus.ACTIVE },
      });
      throw error;
    }
  }
  
  /**
   * Cancel a draw
   */
  static async cancelDraw(drawId: string, reason: string) {
    const draw = await prisma.draw.update({
      where: { id: drawId },
      data: { status: DrawStatus.CANCELLED },
    });
    
    // Mark all tickets as cancelled
    await prisma.ticket.updateMany({
      where: { drawId },
      data: { status: TicketStatus.CANCELLED },
    });
    
    await createAuditLog({
      action: 'DRAW_CANCELLED',
      entityType: 'Draw',
      entityId: draw.id,
      metadata: { reason },
    });
    
    return draw;
  }
}