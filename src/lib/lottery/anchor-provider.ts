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
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockAnchor();
      }
      throw error;
    }
  }
  
  async getAnchorAtHeight(height: number): Promise<BlockchainAnchor> {
    try {
      const response = await axios.get(`${this.baseUrl}/block-height/${height}?format=json`);
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
      blockHash: '0000000000000000000' + crypto.randomBytes(20).toString('hex'),
      timestamp: new Date(),
    };
  }
}

/**
 * Ethereum anchor provider
 */
export class EthereumAnchorProvider implements AnchorProvider {
  private baseUrl = process.env.ETHEREUM_RPC_URL || 'https://eth.public-rpc.com';
  
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
          blockHeight: 18000000 + Math.floor(Math.random() * 1000),
          blockHash: '0x' + crypto.randomBytes(32).toString('hex'),
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

// Factory function to get anchor provider
export function getAnchorProvider(network: 'bitcoin' | 'ethereum' = 'bitcoin'): AnchorProvider {
  switch (network) {
    case 'bitcoin':
      return new BitcoinAnchorProvider();
    case 'ethereum':
      return new EthereumAnchorProvider();
    default:
      return new BitcoinAnchorProvider();
  }
}