import axios from 'axios';

export interface BlockchainAnchor {
  network: 'bitcoin' | 'ethereum';
  blockHeight: number;
  blockHash: string;
  timestamp: Date;
}

export interface AnchorProvider {
  getLatestAnchor(): Promise<BlockchainAnchor>;
  getAnchorAtHeight(height: number): Promise<BlockchainAnchor>;
}

// أداة موحدة لتوليد hex عشوائي (تشتغل في Node.js + Web Crypto)
function randomHex(size: number): string {
  if (typeof (globalThis as any).crypto?.getRandomValues === 'function') {
    // Web Crypto API (Edge runtimes / Browsers)
    const array = new Uint8Array(size);
    (globalThis as any).crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js crypto
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    return nodeCrypto.randomBytes(size).toString('hex');
  }
}

/**
 * Bitcoin anchor provider (using public APIs)
 */
export class BitcoinAnchorProvider implements AnchorProvider {
  private baseUrl = 'https://blockchain.info';

  async getLatestAnchor(): Promise<BlockchainAnchor> {
    try {
      const response = await axios.get(`${this.baseUrl}/latestblock`);
      return {
        network: 'bitcoin',
        blockHeight: response.data.height,
        blockHash: response.data.hash,
        timestamp: new Date(response.data.time * 1000),
      };
    } catch (error) {
      console.error('Failed to fetch Bitcoin anchor:', error);
      if (process.env.NODE_ENV === 'development') {
        return this.getMockAnchor();
      }
      throw error;
    }
  }

  async getAnchorAtHeight(height: number): Promise<BlockchainAnchor> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/block-height/${height}?format=json`
      );
      const block = response.data.blocks[0];
      return {
        network: 'bitcoin',
        blockHeight: block.height,
        blockHash: block.hash,
        timestamp: new Date(block.time * 1000),
      };
    } catch (error) {
      console.error('Failed to fetch Bitcoin anchor at height:', error);
      if (process.env.NODE_ENV === 'development') {
        return this.getMockAnchor();
      }
      throw error;
    }
  }

  private getMockAnchor(): BlockchainAnchor {
    return {
      network: 'bitcoin',
      blockHeight: 820000 + Math.floor(Math.random() * 1000),
      blockHash: '0000000000000000000' + randomHex(20),
      timestamp: new Date(),
    };
  }
}

/**
 * Ethereum anchor provider
 */
export class EthereumAnchorProvider implements AnchorProvider {
  private baseUrl =
    process.env.ETHEREUM_RPC_URL || 'https://eth.public-rpc.com';

  async getLatestAnchor(): Promise<BlockchainAnchor> {
    try {
      const response = await axios.post(this.baseUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: ['latest', false],
        id: 1,
      });

      const block = response.data.result;
      return {
        network: 'ethereum',
        blockHeight: parseInt(block.number, 16),
        blockHash: block.hash,
        timestamp: new Date(parseInt(block.timestamp, 16) * 1000),
      };
    } catch (error) {
      console.error('Failed to fetch Ethereum anchor:', error);
      if (process.env.NODE_ENV === 'development') {
        return {
          network: 'ethereum',
          blockHeight: 18_000_000 + Math.floor(Math.random() * 1000),
          blockHash: '0x' + randomHex(32),
          timestamp: new Date(),
        };
      }
      throw error;
    }
  }

  async getAnchorAtHeight(height: number): Promise<BlockchainAnchor> {
    try {
      const response = await axios.post(this.baseUrl, {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [`0x${height.toString(16)}`, false],
        id: 1,
      });

      const block = response.data.result;
      return {
        network: 'ethereum',
        blockHeight: parseInt(block.number, 16),
        blockHash: block.hash,
        timestamp: new Date(parseInt(block.timestamp, 16) * 1000),
      };
    } catch (error) {
      console.error('Failed to fetch Ethereum anchor at height:', error);
      throw error;
    }
  }
}

/**
 * Factory function to get anchor provider
 */
export function getAnchorProvider(
  network: 'bitcoin' | 'ethereum' = 'bitcoin'
): AnchorProvider {
  switch (network) {
    case 'bitcoin':
      return new BitcoinAnchorProvider();
    case 'ethereum':
      return new EthereumAnchorProvider();
    default:
      return new BitcoinAnchorProvider();
  }
}
