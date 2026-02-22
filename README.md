# ⚡ GrindStake

> **Put your money where your workout is.**

GrindStake is a Web3 fitness accountability platform built on **Arbitrum Sepolia**. Set a fitness goal, stake real ETH, let your friends bet on your success or failure, and let an AI coach push you to win.

🌐 **Live Demo:** [grind-stake-three.vercel.app](https://grind-stake-three.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Network](https://img.shields.io/badge/Network-Arbitrum_Sepolia-blue)](https://arbitrum.io/)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748)](https://www.prisma.io/)
[![AI](https://img.shields.io/badge/AI-OpenAI%20%2F%20Claude-green)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🧠 How It Works

| Step | What Happens |
|------|-------------|
| **1. Challenge** | Set a fitness goal (e.g., "Run 50km in 2 weeks") and stake ETH on Arbitrum Sepolia |
| **2. Bet** | Friends join via private invite link and bet **FOR** or **AGAINST** your success |
| **3. Verify** | Workouts are verified automatically via **Strava API** or manual check-ins |
| **4. Coach** | An AI FitCoach analyzes your real-time data and gives you a personalized training plan |
| **5. Resolve** | Win → you and FOR bettors split the pool. Fail → AGAINST bettors take it all |

---

## ✨ Features

- **Trustless Escrow** — A Solidity smart contract on Arbitrum Sepolia manages all stakes and payouts, no middleman
- **Strava Integration** — Real-time activity syncing via OAuth and Webhooks
- **AI FitCoach** — Context-aware coaching powered by OpenAI/Claude that knows your workout history and active challenges
- **Social Betting** — Private invite links let friends bet on your performance
- **Dynamic UI** — Premium dark-mode interface with Framer Motion animations, spotlight effects, and "Magic" cards
- **Multi-Day Challenges** — Built-in calendar system for tracking daily check-in streaks

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- A wallet with Arbitrum Sepolia testnet ETH
- Strava Developer account (for OAuth)
- OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/your-username/grindstake.git
cd grindstake
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/grindstake"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Strava API
STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_client_secret"
STRAVA_WEBHOOK_VERIFY_TOKEN="GRINDSTAKE_WEBHOOK"
NEXT_PUBLIC_STRAVA_CLIENT_ID="your_strava_client_id"

# AI
OPENAI_API_KEY="your_openai_api_key"

# Arbitrum Sepolia
NEXT_PUBLIC_ARBITRUM_RPC_URL="https://arb-sepolia.g.alchemy.com/v2/your_key"
DEPLOYER_PRIVATE_KEY="your_wallet_private_key"
NEXT_PUBLIC_CONTRACT_ADDRESS="0x..."
```

> ⚠️ **Never commit your `.env` file.** Make sure it's listed in `.gitignore`.

### 3. Database Setup

```bash
# Generate the Prisma client
npx prisma generate

# Push schema to your database
npx prisma db push
```

### 4. Deploy Smart Contract (Optional)

If you want to deploy your own instance of the escrow contract:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network arbitrumSepolia
```

Copy the deployed contract address into your `.env` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📜 Smart Contract

The core escrow logic lives in `contracts/FitnessBet.sol` and is deployed on **Arbitrum Sepolia**.

| Function | Description |
|----------|-------------|
| `createChallenge` | Registers a new fitness goal and locks the creator's initial stake |
| `placeBet` | Allows participants to join the FOR or AGAINST pool |
| `reportOutcome` | Called by the challenge creator to finalize the result |
| `claimWinnings` | Distributes rewards proportionally from the winning pool, minus a **2% protocol fee** |

---

## 🤖 AI Coaching

The AI FitCoach builds a personalized context for every conversation by pulling:

1. The user's **last 20 workouts** from Strava
2. **Progress status** of all active challenges
3. **Stakes on the line** — the AI adjusts its motivational tone based on how much you have at risk

---

## 📁 Project Structure

```
grindstake/
├── app/                  # Next.js App Router pages & API routes
├── components/           # Reusable UI components
├── contracts/            # Solidity smart contracts & Hardhat config
│   └── FitnessBet.sol
├── lib/                  # Utility functions, Prisma client, auth config
├── prisma/               # Database schema
│   └── schema.prisma
├── public/               # Static assets
└── .env                  # Environment variables (never commit this)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM |
| Web3 | Wagmi, Viem, Hardhat (Solidity) |
| Auth | NextAuth (Credentials/Wallet + Strava OAuth) |
| AI | OpenAI SDK (GPT / Claude) |
| Network | Arbitrum Sepolia |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code passes linting and existing tests before submitting.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Built for the Arbitrum Buildathon. 🏗️*