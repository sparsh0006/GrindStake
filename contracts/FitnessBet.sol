// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * FitnessBet — Escrow contract for fitness challenge bets.
 *
 * Simplified Flow:
 *   1. Creator calls createChallenge() to register goal on-chain.
 *   2. Friends call placeBet(challengeId, side) with ETH (0=FOR, 1=AGAINST).
 *   3. After deadline, creator calls reportOutcome() → immediately Resolved.
 *   4. Winners call claimWinnings(). Protocol takes 2% fee from loser pool.
 */
contract FitnessBet {
    address public owner;
    uint256 public protocolFeeBps = 200;
    uint256 public accumulatedFees;
    uint256 public nextChallengeId;

    enum ChallengeState { Active, Resolved, Cancelled }
    enum Side { For, Against }

    struct Challenge {
        address creator;
        bytes32 goalId;
        uint256 deadline;
        uint256 resolvedAt;
        bool    creatorSucceeded;
        ChallengeState state;
        uint256 totalFor;
        uint256 totalAgainst;
    }

    struct Bet {
        address bettor;
        uint256 amount;
        Side    side;
        bool    claimed;
    }

    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public bettors;

    event ChallengeCreated(uint256 indexed challengeId, address indexed creator, bytes32 goalId, uint256 deadline);
    event BetPlaced(uint256 indexed challengeId, address indexed bettor, Side side, uint256 amount);
    event OutcomeReported(uint256 indexed challengeId, bool creatorSucceeded, uint256 resolvedAt);
    event WinningsClaimed(uint256 indexed challengeId, address indexed claimant, uint256 amount);
    event ChallengeCancelled(uint256 indexed challengeId);
    event FeeWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier exists(uint256 challengeId) {
        require(challengeId < nextChallengeId, "Challenge does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createChallenge(bytes32 goalId, uint256 deadline) external payable returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be in future");
        require(msg.value == 0.02 ether, "Must stake 0.02 ether to create");

        uint256 challengeId = nextChallengeId++;
        challenges[challengeId] = Challenge({
            creator:          msg.sender,
            goalId:           goalId,
            deadline:         deadline,
            resolvedAt:       0,
            creatorSucceeded: false,
            state:            ChallengeState.Active,
            totalFor:         msg.value,
            totalAgainst:     0
        });

        // Create implicit bet for creator
        bets[challengeId][msg.sender] = Bet({
            bettor:  msg.sender,
            amount:  msg.value,
            side:    Side.For,
            claimed: false
        });
        bettors[challengeId].push(msg.sender);

        emit ChallengeCreated(challengeId, msg.sender, goalId, deadline);
        emit BetPlaced(challengeId, msg.sender, Side.For, msg.value);

        return challengeId;
    }

    function placeBet(uint256 challengeId, Side side) external payable exists(challengeId) {
        Challenge storage c = challenges[challengeId];
        require(c.state == ChallengeState.Active, "Challenge not active");
        require(block.timestamp < c.deadline, "Betting closed");
        require(msg.sender != c.creator, "Creator cannot bet");
        require(msg.value > 0, "Must send ETH");

        Bet storage b = bets[challengeId][msg.sender];
        if (b.amount == 0) {
            // First time betting = Joining
            require(msg.value >= 0.02 ether, "Must stake at least 0.02 ether to join");
            
            bets[challengeId][msg.sender] = Bet({
                bettor:  msg.sender,
                amount:  msg.value,
                side:    side,
                claimed: false
            });
            bettors[challengeId].push(msg.sender);
        } else {
            require(b.side == side, "Cannot switch sides");
            b.amount += msg.value;
        }

        if (side == Side.For) {
            c.totalFor += msg.value;
        } else {
            c.totalAgainst += msg.value;
        }

        emit BetPlaced(challengeId, msg.sender, side, msg.value);
    }

    /// @notice Creator reports outcome — immediately resolves and unlocks payouts.
    function reportOutcome(uint256 challengeId, bool succeeded) external exists(challengeId) {
        Challenge storage c = challenges[challengeId];
        require(msg.sender == c.creator, "Only creator");
        require(block.timestamp >= c.deadline, "Deadline not reached");
        require(c.state == ChallengeState.Active, "Already resolved");

        c.creatorSucceeded = succeeded;
        c.resolvedAt = block.timestamp;
        c.state = ChallengeState.Resolved;

        emit OutcomeReported(challengeId, succeeded, block.timestamp);
    }

    function claimWinnings(uint256 challengeId) external exists(challengeId) {
        Challenge storage c = challenges[challengeId];
        require(c.state == ChallengeState.Resolved, "Not resolved");

        Bet storage b = bets[challengeId][msg.sender];
        require(b.amount > 0, "No bet found");
        require(!b.claimed, "Already claimed");

        bool isWinner = (c.creatorSucceeded && b.side == Side.For)
                     || (!c.creatorSucceeded && b.side == Side.Against);
        require(isWinner, "Did not win");

        b.claimed = true;

        uint256 winnerPool = c.creatorSucceeded ? c.totalFor : c.totalAgainst;
        uint256 loserPool  = c.creatorSucceeded ? c.totalAgainst : c.totalFor;

        uint256 feeAmount = (loserPool * protocolFeeBps) / 10000;
        uint256 distributableLoserPool = loserPool - feeAmount;
        accumulatedFees += feeAmount;

        uint256 loserShare = winnerPool > 0 ? (distributableLoserPool * b.amount) / winnerPool : 0;
        uint256 payout = b.amount + loserShare;

        (bool ok,) = msg.sender.call{value: payout}("");
        require(ok, "Transfer failed");

        emit WinningsClaimed(challengeId, msg.sender, payout);
    }

    function refund(uint256 challengeId) external exists(challengeId) {
        Challenge storage c = challenges[challengeId];
        require(
            c.state == ChallengeState.Cancelled
            || (c.state == ChallengeState.Resolved && (c.totalFor == 0 || c.totalAgainst == 0)),
            "Refund not applicable"
        );

        Bet storage b = bets[challengeId][msg.sender];
        require(b.amount > 0 && !b.claimed, "Nothing to refund");

        b.claimed = true;
        (bool ok,) = msg.sender.call{value: b.amount}("");
        require(ok, "Refund failed");
    }

    function cancelChallenge(uint256 challengeId) external onlyOwner exists(challengeId) {
        Challenge storage c = challenges[challengeId];
        require(c.state == ChallengeState.Active, "Cannot cancel");
        c.state = ChallengeState.Cancelled;
        emit ChallengeCancelled(challengeId);
    }

    function withdrawFees(address payable to) external onlyOwner {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        (bool ok,) = to.call{value: amount}("");
        require(ok, "Withdrawal failed");
        emit FeeWithdrawn(to, amount);
    }

    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function getBet(uint256 challengeId, address bettor) external view returns (Bet memory) {
        return bets[challengeId][bettor];
    }

    function getBettors(uint256 challengeId) external view returns (address[] memory) {
        return bettors[challengeId];
    }

    receive() external payable {}
}
