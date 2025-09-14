import crypto from 'crypto';

export interface FairnessProof {
  serverSeed: string;
  serverSeedHash: string;
  blockchainAnchor: string;
  combinedHash: string;
  winnerIndex: number;
  totalTickets: number;
  timestamp: Date;
  verificationSteps: string[];
}

export class FairnessCalculator {
  /**
   * Generate a cryptographically secure server seed
   */
  static generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create SHA256 hash of the server seed for public commitment
   */
  static hashServerSeed(seed: string): string {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Combine server seed with blockchain anchor to determine winner
   */
  static calculateWinner(
    serverSeed: string,
    blockchainAnchor: string,
    totalTickets: number
  ): FairnessProof {
    const verificationSteps: string[] = [];
    
    // Step 1: Verify inputs
    verificationSteps.push(`Server seed: ${serverSeed}`);
    verificationSteps.push(`Server seed hash: ${this.hashServerSeed(serverSeed)}`);
    verificationSteps.push(`Blockchain anchor: ${blockchainAnchor}`);
    verificationSteps.push(`Total tickets: ${totalTickets}`);
    
    // Step 2: Combine server seed and blockchain anchor
    const combined = serverSeed + blockchainAnchor;
    verificationSteps.push(`Combined input: ${combined}`);
    
    // Step 3: Create final hash
    const combinedHash = crypto.createHash('sha256').update(combined).digest('hex');
    verificationSteps.push(`Combined hash: ${combinedHash}`);
    
    // Step 4: Convert hash to number
    const hashBigInt = BigInt('0x' + combinedHash);
    verificationSteps.push(`Hash as number: ${hashBigInt.toString()}`);
    
    // Step 5: Calculate winner index using modulo
    const winnerIndex = Number(hashBigInt % BigInt(totalTickets));
    verificationSteps.push(`Winner index: ${winnerIndex} (hash % ${totalTickets})`);
    
    return {
      serverSeed,
      serverSeedHash: this.hashServerSeed(serverSeed),
      blockchainAnchor,
      combinedHash,
      winnerIndex,
      totalTickets,
      timestamp: new Date(),
      verificationSteps,
    };
  }

  /**
   * Verify a fairness proof
   */
  static verifyProof(proof: FairnessProof): boolean {
    // Verify server seed hash matches
    const expectedHash = this.hashServerSeed(proof.serverSeed);
    if (expectedHash !== proof.serverSeedHash) {
      return false;
    }
    
    // Recalculate winner
    const recalculated = this.calculateWinner(
      proof.serverSeed,
      proof.blockchainAnchor,
      proof.totalTickets
    );
    
    return recalculated.winnerIndex === proof.winnerIndex &&
           recalculated.combinedHash === proof.combinedHash;
  }
}