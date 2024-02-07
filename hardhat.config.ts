import 'hardhat-typechain'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'

export default {
  mocha: { timeout: 90000 },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrumRinkeby: {
      url: `https://arbitrum-rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    arbitrum: {
      url: `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    optimismKovan: {
      url: `https://optimism-kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    optimism: {
      url: `https://optimism-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    },
    bnb: {
      url: `https://bsc-dataseed.binance.org/`,
    },
    seilocal: {
      url: "http://127.0.0.1:8545",
      address: [
        // anvil accounts
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      ],
      accounts: [
        // anvil accounts
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
      ], // Replace with your private key
    },
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      address: [
        "0xF87A299e6bC7bEba58dbBe5a5Aa21d49bCD16D52",
        "0x6DAF84B715612Caa9da1813cA26f9b7DFB79D55d",
      ],
      accounts: [
        "0x57acb95d82739866a5c29e40b0aa2590742ae50425b7dd5b5d279a986370189e",
        "0x6e3a6c3c1742393612f0f2e53579631ce1c9d597075fd0a159268d832158bdce",
      ],
    },
    basesepolia: {
      url: "https://sepolia.base.org",
      address: [
        "0xF87A299e6bC7bEba58dbBe5a5Aa21d49bCD16D52",
        "0x6DAF84B715612Caa9da1813cA26f9b7DFB79D55d",
      ],
      accounts: [
        "0x57acb95d82739866a5c29e40b0aa2590742ae50425b7dd5b5d279a986370189e",
        "0x6e3a6c3c1742393612f0f2e53579631ce1c9d597075fd0a159268d832158bdce",
      ],
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
        bytecodeHash: 'none',
      },
    },
  },
}
