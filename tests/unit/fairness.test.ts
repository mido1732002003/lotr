import { FairnessCalculator } from '@/lib/lottery/fairness';

describe('FairnessCalculator', () => {
  describe('generateServerSeed', () => {
    it('should generate a 64-character hex string', () => {
      const seed = FairnessCalculator.generateServerSeed();
      expect(seed).toHaveLength(64);
      expect(seed).toMatch(/^[a-f0-9]{64}$/);
    });
    
    it('should generate unique seeds', () => {
      const seed1 = FairnessCalculator.generateServerSeed();
      const seed2 = FairnessCalculator.generateServerSeed();
      expect(seed1).not.toEqual(seed2);
    });
  });
  
  describe('hashServerSeed', () => {
    it('should produce consistent hash for same input', () => {
      const seed = 'test-seed-123';
      const hash1 = FairnessCalculator.hashServerSeed(seed);
      const hash2 = FairnessCalculator.hashServerSeed(seed);
      expect(hash1).toEqual(hash2);
    });
    
    it('should produce different hashes for different inputs', () => {
      const hash1 = FairnessCalculator.hashServerSeed('seed1');
      const hash2 = FairnessCalculator.hashServerSeed('seed2');
      expect(hash1).not.toEqual(hash2);
    });
  });
  
  describe('calculateWinner', () => {
    it('should calculate winner deterministically', () => {
      const serverSeed = 'abc123';
      const blockHash = 'def456';
      const totalTickets = 100;
      
      const proof1 = FairnessCalculator.calculateWinner(serverSeed, blockHash, totalTickets);
      const proof2 = FairnessCalculator.calculateWinner(serverSeed, blockHash, totalTickets);
      
      expect(proof1.winnerIndex).toEqual(proof2.winnerIndex);
      expect(proof1.combinedHash).toEqual(proof2.combinedHash);
    });
    
    it('should produce winner index within valid range', () => {
      const serverSeed = FairnessCalculator.generateServerSeed();
      const blockHash = '0000000000000000000123abc';
      const totalTickets = 50;
      
      const proof = FairnessCalculator.calculateWinner(serverSeed, blockHash, totalTickets);
      
      expect(proof.winnerIndex).toBeGreaterThanOrEqual(0);
      expect(proof.winnerIndex).toBeLessThan(totalTickets);
    });
    
    it('should include verification steps', () => {
      const proof = FairnessCalculator.calculateWinner('seed', 'anchor', 10);
      
      expect(proof.verificationSteps).toBeInstanceOf(Array);
      expect(proof.verificationSteps.length).toBeGreaterThan(0);
      expect(proof.verificationSteps[0]).toContain('Server seed');
    });
  });
  
  describe('verifyProof', () => {
    it('should verify valid proof', () => {
      const serverSeed = 'test-seed';
      const blockHash = 'test-anchor';
      const totalTickets = 20;
      
      const proof = FairnessCalculator.calculateWinner(serverSeed, blockHash, totalTickets);
      const isValid = FairnessCalculator.verifyProof(proof);
      
      expect(isValid).toBe(true);
    });
    
    it('should reject proof with wrong server seed', () => {
      const proof = FairnessCalculator.calculateWinner('seed1', 'anchor', 10);
      proof.serverSeed = 'wrong-seed';
      
      const isValid = FairnessCalculator.verifyProof(proof);
      expect(isValid).toBe(false);
    });
    
    it('should reject proof with wrong winner index', () => {
      const proof = FairnessCalculator.calculateWinner('seed', 'anchor', 10);
      proof.winnerIndex = (proof.winnerIndex + 1) % 10;
      
      const isValid = FairnessCalculator.verifyProof(proof);
      expect(isValid).toBe(false);
    });
  });
});