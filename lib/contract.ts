import type { Address } from "viem";

export const FITNESS_BET_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address;

export const FITNESS_BET_ABI = [
  {
    name: "createChallenge",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "goalId", type: "bytes32" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "placeBet",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "side", type: "uint8" },
    ],
    outputs: [],
  },
  {
    name: "reportOutcome",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "challengeId", type: "uint256" },
      { name: "succeeded", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "finalize",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimWinnings",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "refund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getChallenge",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "creator", type: "address" },
          { name: "goalId", type: "bytes32" },
          { name: "deadline", type: "uint256" },
          { name: "resolvedAt", type: "uint256" },
          { name: "creatorSucceeded", type: "bool" },
          { name: "state", type: "uint8" },
          { name: "totalFor", type: "uint256" },
          { name: "totalAgainst", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getBettors",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "challengeId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "ChallengeCreated",
    type: "event",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "goalId", type: "bytes32", indexed: false },
      { name: "deadline", type: "uint256", indexed: false },
    ],
  },
  {
    name: "BetPlaced",
    type: "event",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "bettor", type: "address", indexed: true },
      { name: "side", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "OutcomeReported",
    type: "event",
    inputs: [
      { name: "challengeId", type: "uint256", indexed: true },
      { name: "creatorSucceeded", type: "bool", indexed: false },
      { name: "resolvedAt", type: "uint256", indexed: false },
    ],
  },
] as const;
