import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Deal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dealAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'market_', internalType: 'address', type: 'address' },
      { name: 'offer_', internalType: 'address', type: 'address' },
      { name: 'taker_', internalType: 'address', type: 'address' },
      { name: 'tokenAmount_', internalType: 'uint256', type: 'uint256' },
      { name: 'fiatAmount_', internalType: 'uint256', type: 'uint256' },
      { name: 'paymentInstructions_', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'state', internalType: 'enum Deal.State', type: 'uint8' }],
    name: 'ActionNotAllowedInThisState',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'UnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'state',
        internalType: 'enum Deal.State',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DealState',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      { name: 'upvote', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'FeedbackGiven',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'message',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'Message',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accept',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'allowCancelUnacceptedAfter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'allowCancelUnpaidAfter',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'assignMediator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dispute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'upvote', internalType: 'bool', type: 'bool' },
      { name: 'message_', internalType: 'string', type: 'string' },
    ],
    name: 'feedback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feedbackForOwner',
    outputs: [
      { name: 'given', internalType: 'bool', type: 'bool' },
      { name: 'upvote', internalType: 'bool', type: 'bool' },
      { name: 'message', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feedbackForTaker',
    outputs: [
      { name: 'given', internalType: 'bool', type: 'bool' },
      { name: 'upvote', internalType: 'bool', type: 'bool' },
      { name: 'message', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fiatAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'message_', internalType: 'string', type: 'string' }],
    name: 'message',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'offer',
    outputs: [{ name: '', internalType: 'contract Offer', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paid',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paymentInstructions',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'state',
    outputs: [{ name: '', internalType: 'enum Deal.State', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'taker',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'terms',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'tokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DealFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const dealFactoryAbi = [
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'UnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offer_', internalType: 'address', type: 'address' },
      { name: 'fiatAmount_', internalType: 'uint256', type: 'uint256' },
      { name: 'paymentInstructions_', internalType: 'string', type: 'string' },
    ],
    name: 'create',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'market_', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'market',
    outputs: [{ name: '', internalType: 'contract Market', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Market
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const marketAbi = [
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  {
    type: 'error',
    inputs: [{ name: 'fiat', internalType: 'string', type: 'string' }],
    name: 'InvalidFiat',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'method', internalType: 'string', type: 'string' }],
    name: 'InvalidMethod',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'string', type: 'string' }],
    name: 'InvalidToken',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'UnauthorizedAccount',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'offerOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'taker',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'offer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'deal',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'DealCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'token', internalType: 'string', type: 'string', indexed: true },
      { name: 'fiat', internalType: 'string', type: 'string', indexed: true },
      {
        name: 'offer',
        internalType: 'contract Offer',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'OfferCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'deal', internalType: 'contract Deal', type: 'address' }],
    name: 'addDeal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'fiats_',
        internalType: 'struct Fiats.Fiat[]',
        type: 'tuple[]',
        components: [
          { name: 'symbol', internalType: 'string', type: 'string' },
          {
            name: 'toUSD',
            internalType: 'contract IChainlink',
            type: 'address',
          },
        ],
      },
    ],
    name: 'addFiats',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'new_',
        internalType: 'struct Methods.Method[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'group', internalType: 'enum Methods.Group', type: 'uint8' },
        ],
      },
    ],
    name: 'addMethods',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offer', internalType: 'contract Offer', type: 'address' },
    ],
    name: 'addOffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokens_', internalType: 'address[]', type: 'address[]' },
      { name: 'uniswapPoolFee', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'addTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount_', internalType: 'uint256', type: 'uint256' },
      { name: 'fromFiat_', internalType: 'string', type: 'string' },
      { name: 'toToken_', internalType: 'string', type: 'string' },
      { name: 'denominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'convert',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'dealFactory',
    outputs: [
      { name: '', internalType: 'contract DealFactory', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'symbol_', internalType: 'string', type: 'string' }],
    name: 'fiat',
    outputs: [
      {
        name: '',
        internalType: 'struct Fiats.Fiat',
        type: 'tuple',
        components: [
          { name: 'symbol', internalType: 'string', type: 'string' },
          {
            name: 'toUSD',
            internalType: 'contract IChainlink',
            type: 'address',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fundDeal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFiats',
    outputs: [{ name: '', internalType: 'bytes32[]', type: 'bytes32[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMethods',
    outputs: [
      {
        name: '',
        internalType: 'struct Methods.Method[]',
        type: 'tuple[]',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'group', internalType: 'enum Methods.Group', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isSell_', internalType: 'bool', type: 'bool' },
      { name: 'token_', internalType: 'string', type: 'string' },
      { name: 'fiat_', internalType: 'string', type: 'string' },
      { name: 'method_', internalType: 'string', type: 'string' },
    ],
    name: 'getOffers',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token_', internalType: 'string', type: 'string' },
      { name: 'fiat_', internalType: 'string', type: 'string' },
    ],
    name: 'getPrice',
    outputs: [{ name: 'price', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTokens',
    outputs: [
      {
        name: '',
        internalType: 'struct Tokens.Token[]',
        type: 'tuple[]',
        components: [
          {
            name: 'api',
            internalType: 'contract IERC20Metadata',
            type: 'address',
          },
          { name: 'symbol', internalType: 'string', type: 'string' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'decimals', internalType: 'uint8', type: 'uint8' },
          { name: 'uniswapPoolFee', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'offer_', internalType: 'address', type: 'address' }],
    name: 'hasOffer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offerFactory_', internalType: 'address', type: 'address' },
      { name: 'dealFactory_', internalType: 'address', type: 'address' },
      { name: 'repToken_', internalType: 'address', type: 'address' },
      { name: 'uniswap_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'mediator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'symbol_', internalType: 'string', type: 'string' }],
    name: 'method',
    outputs: [
      {
        name: '',
        internalType: 'struct Methods.Method',
        type: 'tuple',
        components: [
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'group', internalType: 'enum Methods.Group', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'offerFactory',
    outputs: [
      { name: '', internalType: 'contract OfferFactory', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'fiat_', internalType: 'string[]', type: 'string[]' }],
    name: 'removeFiats',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'names_', internalType: 'string[]', type: 'string[]' }],
    name: 'removeMethods',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'token_', internalType: 'string[]', type: 'string[]' }],
    name: 'removeTokens',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'repToken',
    outputs: [{ name: '', internalType: 'contract RepToken', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dealFactory_', internalType: 'address', type: 'address' },
    ],
    name: 'setDealFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'mediator_', internalType: 'address', type: 'address' }],
    name: 'setMediator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offerFactory_', internalType: 'address', type: 'address' },
    ],
    name: 'setOfferFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'symbol_', internalType: 'string', type: 'string' }],
    name: 'token',
    outputs: [
      {
        name: '',
        internalType: 'struct Tokens.Token',
        type: 'tuple',
        components: [
          {
            name: 'api',
            internalType: 'contract IERC20Metadata',
            type: 'address',
          },
          { name: 'symbol', internalType: 'string', type: 'string' },
          { name: 'name', internalType: 'string', type: 'string' },
          { name: 'decimals', internalType: 'uint8', type: 'uint8' },
          { name: 'uniswapPoolFee', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Offer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const offerAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'owner_', internalType: 'address', type: 'address' },
      { name: 'isSell_', internalType: 'bool', type: 'bool' },
      { name: 'token_', internalType: 'string', type: 'string' },
      { name: 'fiat_', internalType: 'string', type: 'string' },
      { name: 'method_', internalType: 'string', type: 'string' },
      { name: 'rate_', internalType: 'uint16', type: 'uint16' },
      {
        name: 'limits_',
        internalType: 'struct Offer.Limits',
        type: 'tuple',
        components: [
          { name: 'min', internalType: 'uint32', type: 'uint32' },
          { name: 'max', internalType: 'uint32', type: 'uint32' },
        ],
      },
      { name: 'terms_', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'UnauthorizedAccount',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'OfferUpdated' },
  {
    type: 'function',
    inputs: [],
    name: 'disabled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fiat',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isSell',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'limits',
    outputs: [
      { name: 'min', internalType: 'uint32', type: 'uint32' },
      { name: 'max', internalType: 'uint32', type: 'uint32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'method',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'rate',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'disabled_', internalType: 'bool', type: 'bool' }],
    name: 'setDisabled',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'limits_',
        internalType: 'struct Offer.Limits',
        type: 'tuple',
        components: [
          { name: 'min', internalType: 'uint32', type: 'uint32' },
          { name: 'max', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    name: 'setLimits',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'rate_', internalType: 'uint16', type: 'uint16' }],
    name: 'setRate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'terms_', internalType: 'string', type: 'string' }],
    name: 'setTerms',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'terms',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OfferFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const offerFactoryAbi = [
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'isSell_', internalType: 'bool', type: 'bool' },
      { name: 'token_', internalType: 'string', type: 'string' },
      { name: 'fiat_', internalType: 'string', type: 'string' },
      { name: 'method_', internalType: 'string', type: 'string' },
      { name: 'rate_', internalType: 'uint16', type: 'uint16' },
      {
        name: 'limits_',
        internalType: 'struct Offer.Limits',
        type: 'tuple',
        components: [
          { name: 'min', internalType: 'uint32', type: 'uint32' },
          { name: 'max', internalType: 'uint32', type: 'uint32' },
        ],
      },
      { name: 'terms_', internalType: 'string', type: 'string' },
    ],
    name: 'create',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'market_', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'market',
    outputs: [{ name: '', internalType: 'contract Market', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RepToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const repTokenAbi = [
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC721IncorrectOwner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC721InsufficientApproval',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'operator', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOperator',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC721InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC721NonexistentToken',
  },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
      { name: '_otherTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'merge',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'ownerToTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'register',
    outputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'stats',
    outputs: [
      { name: 'createdAt', internalType: 'uint32', type: 'uint32' },
      { name: 'upvotes', internalType: 'uint32', type: 'uint32' },
      { name: 'downvotes', internalType: 'uint32', type: 'uint32' },
      { name: 'volumeUSD', internalType: 'uint64', type: 'uint64' },
      { name: 'dealsCompleted', internalType: 'uint32', type: 'uint32' },
      { name: 'dealsExpired', internalType: 'uint32', type: 'uint32' },
      { name: 'disputesLost', internalType: 'uint32', type: 'uint32' },
      { name: 'avgPaymentTime', internalType: 'uint32', type: 'uint32' },
      { name: 'avgReleaseTime', internalType: 'uint32', type: 'uint32' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
      { name: '_dealTime', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'statsAvgPaymentTime',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
      { name: '_dealTime', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'statsAvgReleaseTime',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId_', internalType: 'uint256', type: 'uint256' }],
    name: 'statsDealCompleted',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId_', internalType: 'uint256', type: 'uint256' }],
    name: 'statsDealExpired',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId_', internalType: 'uint256', type: 'uint256' }],
    name: 'statsDisputeLost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
      { name: '_volumeUSD', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'statsVolumeUSD',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
      { name: 'up_', internalType: 'bool', type: 'bool' },
    ],
    name: 'statsVote',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__
 */
export const useReadDeal = /*#__PURE__*/ createUseReadContract({ abi: dealAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadDealDefaultAdminRole = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'DEFAULT_ADMIN_ROLE',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"allowCancelUnacceptedAfter"`
 */
export const useReadDealAllowCancelUnacceptedAfter =
  /*#__PURE__*/ createUseReadContract({
    abi: dealAbi,
    functionName: 'allowCancelUnacceptedAfter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"allowCancelUnpaidAfter"`
 */
export const useReadDealAllowCancelUnpaidAfter =
  /*#__PURE__*/ createUseReadContract({
    abi: dealAbi,
    functionName: 'allowCancelUnpaidAfter',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"feedbackForOwner"`
 */
export const useReadDealFeedbackForOwner = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'feedbackForOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"feedbackForTaker"`
 */
export const useReadDealFeedbackForTaker = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'feedbackForTaker',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"fiatAmount"`
 */
export const useReadDealFiatAmount = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'fiatAmount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadDealGetRoleAdmin = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadDealHasRole = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"offer"`
 */
export const useReadDealOffer = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'offer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"paymentInstructions"`
 */
export const useReadDealPaymentInstructions =
  /*#__PURE__*/ createUseReadContract({
    abi: dealAbi,
    functionName: 'paymentInstructions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"state"`
 */
export const useReadDealState = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'state',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadDealSupportsInterface = /*#__PURE__*/ createUseReadContract(
  { abi: dealAbi, functionName: 'supportsInterface' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"taker"`
 */
export const useReadDealTaker = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'taker',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"terms"`
 */
export const useReadDealTerms = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'terms',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"tokenAmount"`
 */
export const useReadDealTokenAmount = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'tokenAmount',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__
 */
export const useWriteDeal = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"accept"`
 */
export const useWriteDealAccept = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'accept',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"assignMediator"`
 */
export const useWriteDealAssignMediator = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'assignMediator',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteDealCancel = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"dispute"`
 */
export const useWriteDealDispute = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'dispute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"feedback"`
 */
export const useWriteDealFeedback = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'feedback',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"fund"`
 */
export const useWriteDealFund = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'fund',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteDealGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"message"`
 */
export const useWriteDealMessage = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'message',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"paid"`
 */
export const useWriteDealPaid = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'paid',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"release"`
 */
export const useWriteDealRelease = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'release',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteDealRenounceRole = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'renounceRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteDealRevokeRole = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__
 */
export const useSimulateDeal = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"accept"`
 */
export const useSimulateDealAccept = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'accept',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"assignMediator"`
 */
export const useSimulateDealAssignMediator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealAbi,
    functionName: 'assignMediator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateDealCancel = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'cancel',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"dispute"`
 */
export const useSimulateDealDispute = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'dispute',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"feedback"`
 */
export const useSimulateDealFeedback = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'feedback',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"fund"`
 */
export const useSimulateDealFund = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'fund',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateDealGrantRole = /*#__PURE__*/ createUseSimulateContract(
  { abi: dealAbi, functionName: 'grantRole' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"message"`
 */
export const useSimulateDealMessage = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'message',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"paid"`
 */
export const useSimulateDealPaid = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'paid',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"release"`
 */
export const useSimulateDealRelease = /*#__PURE__*/ createUseSimulateContract({
  abi: dealAbi,
  functionName: 'release',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateDealRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateDealRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__
 */
export const useWatchDealEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: dealAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"DealState"`
 */
export const useWatchDealDealStateEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'DealState',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"FeedbackGiven"`
 */
export const useWatchDealFeedbackGivenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'FeedbackGiven',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"Message"`
 */
export const useWatchDealMessageEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'Message',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchDealRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchDealRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchDealRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealFactoryAbi}__
 */
export const useReadDealFactory = /*#__PURE__*/ createUseReadContract({
  abi: dealFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadDealFactoryUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: dealFactoryAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"market"`
 */
export const useReadDealFactoryMarket = /*#__PURE__*/ createUseReadContract({
  abi: dealFactoryAbi,
  functionName: 'market',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadDealFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: dealFactoryAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadDealFactoryProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: dealFactoryAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealFactoryAbi}__
 */
export const useWriteDealFactory = /*#__PURE__*/ createUseWriteContract({
  abi: dealFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"create"`
 */
export const useWriteDealFactoryCreate = /*#__PURE__*/ createUseWriteContract({
  abi: dealFactoryAbi,
  functionName: 'create',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteDealFactoryInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: dealFactoryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteDealFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: dealFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteDealFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: dealFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteDealFactoryUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: dealFactoryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealFactoryAbi}__
 */
export const useSimulateDealFactory = /*#__PURE__*/ createUseSimulateContract({
  abi: dealFactoryAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"create"`
 */
export const useSimulateDealFactoryCreate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealFactoryAbi,
    functionName: 'create',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateDealFactoryInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealFactoryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateDealFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateDealFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealFactoryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateDealFactoryUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealFactoryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealFactoryAbi}__
 */
export const useWatchDealFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: dealFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealFactoryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchDealFactoryInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealFactoryAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchDealFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealFactoryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchDealFactoryUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealFactoryAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__
 */
export const useReadMarket = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadMarketUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: marketAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"convert"`
 */
export const useReadMarketConvert = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'convert',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"dealFactory"`
 */
export const useReadMarketDealFactory = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'dealFactory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"fiat"`
 */
export const useReadMarketFiat = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'fiat',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getFiats"`
 */
export const useReadMarketGetFiats = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'getFiats',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getMethods"`
 */
export const useReadMarketGetMethods = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'getMethods',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getOffers"`
 */
export const useReadMarketGetOffers = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'getOffers',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getPrice"`
 */
export const useReadMarketGetPrice = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'getPrice',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getTokens"`
 */
export const useReadMarketGetTokens = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'getTokens',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"hasOffer"`
 */
export const useReadMarketHasOffer = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'hasOffer',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"mediator"`
 */
export const useReadMarketMediator = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'mediator',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"method"`
 */
export const useReadMarketMethod = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'method',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"offerFactory"`
 */
export const useReadMarketOfferFactory = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'offerFactory',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMarketOwner = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadMarketProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"repToken"`
 */
export const useReadMarketRepToken = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'repToken',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"token"`
 */
export const useReadMarketToken = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__
 */
export const useWriteMarket = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addDeal"`
 */
export const useWriteMarketAddDeal = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addDeal',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addFiats"`
 */
export const useWriteMarketAddFiats = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addFiats',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addMethods"`
 */
export const useWriteMarketAddMethods = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addMethods',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addOffer"`
 */
export const useWriteMarketAddOffer = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addOffer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addTokens"`
 */
export const useWriteMarketAddTokens = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addTokens',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"fundDeal"`
 */
export const useWriteMarketFundDeal = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'fundDeal',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteMarketInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeFiats"`
 */
export const useWriteMarketRemoveFiats = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'removeFiats',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeMethods"`
 */
export const useWriteMarketRemoveMethods = /*#__PURE__*/ createUseWriteContract(
  { abi: marketAbi, functionName: 'removeMethods' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeTokens"`
 */
export const useWriteMarketRemoveTokens = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'removeTokens',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMarketRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setDealFactory"`
 */
export const useWriteMarketSetDealFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    functionName: 'setDealFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setMediator"`
 */
export const useWriteMarketSetMediator = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'setMediator',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setOfferFactory"`
 */
export const useWriteMarketSetOfferFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    functionName: 'setOfferFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMarketTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteMarketUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__
 */
export const useSimulateMarket = /*#__PURE__*/ createUseSimulateContract({
  abi: marketAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addDeal"`
 */
export const useSimulateMarketAddDeal = /*#__PURE__*/ createUseSimulateContract(
  { abi: marketAbi, functionName: 'addDeal' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addFiats"`
 */
export const useSimulateMarketAddFiats =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'addFiats',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addMethods"`
 */
export const useSimulateMarketAddMethods =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'addMethods',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addOffer"`
 */
export const useSimulateMarketAddOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'addOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addTokens"`
 */
export const useSimulateMarketAddTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'addTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"fundDeal"`
 */
export const useSimulateMarketFundDeal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'fundDeal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateMarketInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeFiats"`
 */
export const useSimulateMarketRemoveFiats =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'removeFiats',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeMethods"`
 */
export const useSimulateMarketRemoveMethods =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'removeMethods',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeTokens"`
 */
export const useSimulateMarketRemoveTokens =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'removeTokens',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMarketRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setDealFactory"`
 */
export const useSimulateMarketSetDealFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'setDealFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setMediator"`
 */
export const useSimulateMarketSetMediator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'setMediator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setOfferFactory"`
 */
export const useSimulateMarketSetOfferFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'setOfferFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMarketTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateMarketUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__
 */
export const useWatchMarketEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: marketAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"DealCreated"`
 */
export const useWatchMarketDealCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'DealCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchMarketInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"OfferCreated"`
 */
export const useWatchMarketOfferCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'OfferCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMarketOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchMarketUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__
 */
export const useReadOffer = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"disabled"`
 */
export const useReadOfferDisabled = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'disabled',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"fiat"`
 */
export const useReadOfferFiat = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'fiat',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"isSell"`
 */
export const useReadOfferIsSell = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'isSell',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"limits"`
 */
export const useReadOfferLimits = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'limits',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"method"`
 */
export const useReadOfferMethod = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'method',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOfferOwner = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"rate"`
 */
export const useReadOfferRate = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'rate',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"terms"`
 */
export const useReadOfferTerms = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'terms',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"token"`
 */
export const useReadOfferToken = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__
 */
export const useWriteOffer = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setDisabled"`
 */
export const useWriteOfferSetDisabled = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
  functionName: 'setDisabled',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setLimits"`
 */
export const useWriteOfferSetLimits = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
  functionName: 'setLimits',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setRate"`
 */
export const useWriteOfferSetRate = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
  functionName: 'setRate',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setTerms"`
 */
export const useWriteOfferSetTerms = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
  functionName: 'setTerms',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__
 */
export const useSimulateOffer = /*#__PURE__*/ createUseSimulateContract({
  abi: offerAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setDisabled"`
 */
export const useSimulateOfferSetDisabled =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerAbi,
    functionName: 'setDisabled',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setLimits"`
 */
export const useSimulateOfferSetLimits =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerAbi,
    functionName: 'setLimits',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setRate"`
 */
export const useSimulateOfferSetRate = /*#__PURE__*/ createUseSimulateContract({
  abi: offerAbi,
  functionName: 'setRate',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"setTerms"`
 */
export const useSimulateOfferSetTerms = /*#__PURE__*/ createUseSimulateContract(
  { abi: offerAbi, functionName: 'setTerms' },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerAbi}__
 */
export const useWatchOfferEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: offerAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerAbi}__ and `eventName` set to `"OfferUpdated"`
 */
export const useWatchOfferOfferUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: offerAbi,
    eventName: 'OfferUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerFactoryAbi}__
 */
export const useReadOfferFactory = /*#__PURE__*/ createUseReadContract({
  abi: offerFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadOfferFactoryUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: offerFactoryAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"market"`
 */
export const useReadOfferFactoryMarket = /*#__PURE__*/ createUseReadContract({
  abi: offerFactoryAbi,
  functionName: 'market',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadOfferFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: offerFactoryAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadOfferFactoryProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: offerFactoryAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerFactoryAbi}__
 */
export const useWriteOfferFactory = /*#__PURE__*/ createUseWriteContract({
  abi: offerFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"create"`
 */
export const useWriteOfferFactoryCreate = /*#__PURE__*/ createUseWriteContract({
  abi: offerFactoryAbi,
  functionName: 'create',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteOfferFactoryInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: offerFactoryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteOfferFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: offerFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteOfferFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: offerFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteOfferFactoryUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: offerFactoryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerFactoryAbi}__
 */
export const useSimulateOfferFactory = /*#__PURE__*/ createUseSimulateContract({
  abi: offerFactoryAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"create"`
 */
export const useSimulateOfferFactoryCreate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerFactoryAbi,
    functionName: 'create',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateOfferFactoryInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerFactoryAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateOfferFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateOfferFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerFactoryAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateOfferFactoryUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerFactoryAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerFactoryAbi}__
 */
export const useWatchOfferFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: offerFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerFactoryAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchOfferFactoryInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: offerFactoryAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchOfferFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: offerFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerFactoryAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchOfferFactoryUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: offerFactoryAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__
 */
export const useReadRepToken = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadRepTokenDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: repTokenAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadRepTokenUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: repTokenAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadRepTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadRepTokenGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadRepTokenGetRoleAdmin = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'getRoleAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadRepTokenHasRole = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadRepTokenIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: repTokenAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadRepTokenName = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadRepTokenOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"ownerToTokenId"`
 */
export const useReadRepTokenOwnerToTokenId =
  /*#__PURE__*/ createUseReadContract({
    abi: repTokenAbi,
    functionName: 'ownerToTokenId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadRepTokenProxiableUuid = /*#__PURE__*/ createUseReadContract(
  { abi: repTokenAbi, functionName: 'proxiableUUID' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"stats"`
 */
export const useReadRepTokenStats = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'stats',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadRepTokenSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: repTokenAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadRepTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadRepTokenTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: repTokenAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__
 */
export const useWriteRepToken = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteRepTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteRepTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteRepTokenGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteRepTokenInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"merge"`
 */
export const useWriteRepTokenMerge = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'merge',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"register"`
 */
export const useWriteRepTokenRegister = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'register',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteRepTokenRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteRepTokenRevokeRole = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'revokeRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteRepTokenSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteRepTokenSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsAvgPaymentTime"`
 */
export const useWriteRepTokenStatsAvgPaymentTime =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'statsAvgPaymentTime',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsAvgReleaseTime"`
 */
export const useWriteRepTokenStatsAvgReleaseTime =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'statsAvgReleaseTime',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsDealCompleted"`
 */
export const useWriteRepTokenStatsDealCompleted =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'statsDealCompleted',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsDealExpired"`
 */
export const useWriteRepTokenStatsDealExpired =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'statsDealExpired',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsDisputeLost"`
 */
export const useWriteRepTokenStatsDisputeLost =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'statsDisputeLost',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsVolumeUSD"`
 */
export const useWriteRepTokenStatsVolumeUsd =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'statsVolumeUSD',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsVote"`
 */
export const useWriteRepTokenStatsVote = /*#__PURE__*/ createUseWriteContract({
  abi: repTokenAbi,
  functionName: 'statsVote',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteRepTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteRepTokenUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: repTokenAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__
 */
export const useSimulateRepToken = /*#__PURE__*/ createUseSimulateContract({
  abi: repTokenAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateRepTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateRepTokenBurn = /*#__PURE__*/ createUseSimulateContract({
  abi: repTokenAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateRepTokenGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateRepTokenInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"merge"`
 */
export const useSimulateRepTokenMerge = /*#__PURE__*/ createUseSimulateContract(
  { abi: repTokenAbi, functionName: 'merge' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"register"`
 */
export const useSimulateRepTokenRegister =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'register',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateRepTokenRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateRepTokenRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateRepTokenSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateRepTokenSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsAvgPaymentTime"`
 */
export const useSimulateRepTokenStatsAvgPaymentTime =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsAvgPaymentTime',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsAvgReleaseTime"`
 */
export const useSimulateRepTokenStatsAvgReleaseTime =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsAvgReleaseTime',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsDealCompleted"`
 */
export const useSimulateRepTokenStatsDealCompleted =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsDealCompleted',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsDealExpired"`
 */
export const useSimulateRepTokenStatsDealExpired =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsDealExpired',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsDisputeLost"`
 */
export const useSimulateRepTokenStatsDisputeLost =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsDisputeLost',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsVolumeUSD"`
 */
export const useSimulateRepTokenStatsVolumeUsd =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsVolumeUSD',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"statsVote"`
 */
export const useSimulateRepTokenStatsVote =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'statsVote',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateRepTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link repTokenAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateRepTokenUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: repTokenAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__
 */
export const useWatchRepTokenEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: repTokenAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchRepTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchRepTokenApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchRepTokenInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchRepTokenRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchRepTokenRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchRepTokenRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchRepTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link repTokenAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchRepTokenUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: repTokenAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Transfer',
  })
