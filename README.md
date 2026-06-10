# .arc Identity Hub

> Decentralized identity dApp for Arc Network — mint, resolve and manage `.arc` domains.

[![Arc Testnet](https://img.shields.io/badge/Arc%20Testnet-Chain%205042002-6366f1)](https://testnet.arcscan.app)
[![ZNS Connect](https://img.shields.io/badge/ZNS%20Connect-Powered-8b5cf6)](https://znsconnect.io)

## Features

- 🔌 **Wallet Connect** — RainbowKit + wagmi v2 on Arc Testnet (Chain ID: 5042002)
- 🔍 **Reverse Resolution** — resolve wallet address → `.arc` domain name via ZNS API
- 🌐 **Forward Resolution** — resolve `.arc` name → wallet address
- 🪙 **Register** — availability check + mint `.arc` domains via ZNS.bio
- 👤 **Profile** — view your primary name, owned domains, and links

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Wallet | RainbowKit + wagmi v2 + viem |
| Identity | ZNS Connect API |
| Animations | Framer Motion |
| Chain | Arc Testnet (Chain ID: 5042002) |

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set up env
cp .env.example .env.local
# Add your WalletConnect Project ID from https://cloud.walletconnect.com

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Network Config

| Parameter | Value |
|-----------|-------|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Gas token | USDC |
| Faucet | [faucet.circle.com](https://faucet.circle.com) |

## ZNS API

Domains on Arc Network are powered by [ZNS Connect](https://znsconnect.io):

- `GET https://zns.bio/api/resolveDomain?chain=5042002&domain=<name>` — domain → address
- `GET https://zns.bio/api/resolveAddress?chain=5042002&address=<addr>` — address → domains

## Roadmap

- [x] Step 1: Chain config, RainbowKit, dark UI layout
- [x] Step 2: Reverse + Forward resolution (ZNS API)
- [x] Step 3: Register UI + availability check + ZNS.bio redirect
- [x] Step 4: Profile page (primary name, owned domains, links)
- [ ] Step 5: On-chain profile records (avatar, bio, socials)
- [ ] Step 6: Send USDC by .arc name
- [ ] Step 7: My Domains management page
