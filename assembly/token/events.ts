

/**
     * @dev Emitted when a proposal is created.
     */
ProposalCreated(
    uint256 proposalId,
    address proposer,
    address[] targets,
    uint256[] values,
    string[] signatures,
    bytes[] calldatas,
    uint256 startBlock,
    uint256 endBlock,
    string description
);

/**
 * @dev Emitted when a proposal is canceled.
 */
event ProposalCanceled(uint256 proposalId);

/**
 * @dev Emitted when a proposal is executed.
 */
event ProposalExecuted(uint256 proposalId);
