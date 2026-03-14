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
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'error',
    inputs: [
      { name: 'state', internalType: 'enum IDeal.State', type: 'uint8' },
    ],
    name: 'ActionNotAllowedInThisState',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'resolvedPaid', internalType: 'bool', type: 'bool' }],
    name: 'InvalidResolution',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
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
        internalType: 'enum IDeal.State',
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
      {
        name: 'domainId',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'DisputeResolved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
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
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
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
    inputs: [{ name: 'assertionId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'assertionDisputedCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assertionId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'assertedTruthfully', internalType: 'bool', type: 'bool' },
    ],
    name: 'assertionResolvedCallback',
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
    inputs: [
      {
        name: 'params',
        internalType: 'struct IDeal.DealParams',
        type: 'tuple',
        components: [
          { name: 'finder', internalType: 'address', type: 'address' },
          { name: 'offer', internalType: 'address', type: 'address' },
          { name: 'taker', internalType: 'address', type: 'address' },
          { name: 'tokenAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'fiatAmount', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'isPaid',
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
    outputs: [{ name: '', internalType: 'contract IOffer', type: 'address' }],
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
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'state',
    outputs: [{ name: '', internalType: 'enum IDeal.State', type: 'uint8' }],
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
    name: 'tokenAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Market
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const marketAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'usdc_', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'error',
    inputs: [
      { name: 'state', internalType: 'enum IDeal.State', type: 'uint8' },
    ],
    name: 'ActionNotAllowedInThisState',
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
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'FailedDeployment' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'InvalidArgument' },
  {
    type: 'error',
    inputs: [{ name: 'fiat', internalType: 'bytes32', type: 'bytes32' }],
    name: 'InvalidFiat',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidLimits' },
  {
    type: 'error',
    inputs: [{ name: 'method', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidMethod',
  },
  { type: 'error', inputs: [], name: 'InvalidRate' },
  {
    type: 'error',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
    ],
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
  { type: 'error', inputs: [], name: 'UnknownOffer' },
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
        indexed: false,
      },
      {
        name: 'offer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'deal',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'method',
        internalType: 'bytes16',
        type: 'bytes16',
        indexed: false,
      },
      { name: 'terms', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'paymentInstructions',
        internalType: 'string',
        type: 'string',
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
        name: 'symbol',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'feed',
        internalType: 'contract IChainlink',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'FiatAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'symbol',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'FiatRemoved',
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
        name: 'name',
        internalType: 'bytes16',
        type: 'bytes16',
        indexed: false,
      },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MethodAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'mask',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MethodsDisabledMask',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: false,
      },
      {
        name: 'fiat',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'offer',
        internalType: 'contract IOffer',
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
        name: 'address_',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TokenAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'address_',
        internalType: 'contract IERC20',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TokenRemoved',
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
    inputs: [],
    name: 'USDC',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'deal', internalType: 'contract IDeal', type: 'address' },
      { name: 'method', internalType: 'bytes16', type: 'bytes16' },
      { name: 'terms', internalType: 'string', type: 'string' },
      { name: 'paymentInstructions', internalType: 'string', type: 'string' },
    ],
    name: 'addDeal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'symbol_', internalType: 'bytes3', type: 'bytes3' },
      {
        name: 'chainlink_',
        internalType: 'contract IChainlink',
        type: 'address',
      },
    ],
    name: 'addFiat',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'names_', internalType: 'bytes16[]', type: 'bytes16[]' }],
    name: 'addMethods',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'address_', internalType: 'contract IERC20', type: 'address' },
      {
        name: 'token_',
        internalType: 'struct IMarket.Token',
        type: 'tuple',
        components: [
          {
            name: 'pool',
            internalType: 'contract IUniswapV3Pool',
            type: 'address',
          },
          { name: 'decimals', internalType: 'uint8', type: 'uint8' },
        ],
      },
    ],
    name: 'addToken',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount_', internalType: 'uint256', type: 'uint256' },
      { name: 'fromFiat_', internalType: 'bytes3', type: 'bytes3' },
      { name: 'toToken_', internalType: 'contract IERC20', type: 'address' },
      { name: 'denominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'convert',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct IOffer.OfferParams',
        type: 'tuple',
        components: [
          { name: 'isSell', internalType: 'bool', type: 'bool' },
          { name: 'rate', internalType: 'uint16', type: 'uint16' },
          {
            name: 'limits',
            internalType: 'struct IOffer.Limits',
            type: 'tuple',
            components: [
              { name: 'min', internalType: 'uint32', type: 'uint32' },
              { name: 'max', internalType: 'uint32', type: 'uint32' },
            ],
          },
          { name: 'token', internalType: 'contract IERC20', type: 'address' },
          { name: 'fiat', internalType: 'bytes3', type: 'bytes3' },
          { name: 'methods', internalType: 'uint256', type: 'uint256' },
          { name: 'terms', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'createOffer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'deals',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'mask', internalType: 'uint256', type: 'uint256' }],
    name: 'disableMethods',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'disabledMethodsMask',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'mask', internalType: 'uint256', type: 'uint256' }],
    name: 'enableMethods',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fee',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes3', type: 'bytes3' }],
    name: 'fiats',
    outputs: [
      { name: '', internalType: 'contract IChainlink', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'finder',
    outputs: [
      { name: '', internalType: 'contract FinderInterface', type: 'address' },
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
    inputs: [
      { name: 'token_', internalType: 'contract IERC20', type: 'address' },
      { name: 'fiat_', internalType: 'bytes3', type: 'bytes3' },
    ],
    name: 'getPrice',
    outputs: [{ name: 'price', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'finder_', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'methods',
    outputs: [{ name: '', internalType: 'bytes16', type: 'bytes16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'offers',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    inputs: [{ name: 'symbol_', internalType: 'bytes3', type: 'bytes3' }],
    name: 'removeFiat',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'address_', internalType: 'contract IERC20', type: 'address' },
    ],
    name: 'removeToken',
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
    inputs: [{ name: 'fee_', internalType: 'uint8', type: 'uint8' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    name: 'tokens',
    outputs: [
      {
        name: 'pool',
        internalType: 'contract IUniswapV3Pool',
        type: 'address',
      },
      { name: 'decimals', internalType: 'uint8', type: 'uint8' },
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
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'FailedDeployment' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidLimits' },
  {
    type: 'error',
    inputs: [{ name: 'method', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidMethod',
  },
  { type: 'error', inputs: [], name: 'InvalidRate' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'OfferDisabled' },
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
  { type: 'event', anonymous: false, inputs: [], name: 'OfferUpdated' },
  {
    type: 'function',
    inputs: [
      { name: 'market', internalType: 'contract IMarket', type: 'address' },
      {
        name: 'params',
        internalType: 'struct IOffer.CreateDealParams',
        type: 'tuple',
        components: [
          { name: 'fiatAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'method', internalType: 'uint8', type: 'uint8' },
          {
            name: 'paymentInstructions',
            internalType: 'string',
            type: 'string',
          },
        ],
      },
    ],
    name: 'createDeal',
    outputs: [],
    stateMutability: 'nonpayable',
  },
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
    outputs: [{ name: '', internalType: 'bytes3', type: 'bytes3' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner_', internalType: 'address', type: 'address' },
      {
        name: 'params',
        internalType: 'struct IOffer.OfferParams',
        type: 'tuple',
        components: [
          { name: 'isSell', internalType: 'bool', type: 'bool' },
          { name: 'rate', internalType: 'uint16', type: 'uint16' },
          {
            name: 'limits',
            internalType: 'struct IOffer.Limits',
            type: 'tuple',
            components: [
              { name: 'min', internalType: 'uint32', type: 'uint32' },
              { name: 'max', internalType: 'uint32', type: 'uint32' },
            ],
          },
          { name: 'token', internalType: 'contract IERC20', type: 'address' },
          { name: 'fiat', internalType: 'bytes3', type: 'bytes3' },
          { name: 'methods', internalType: 'uint256', type: 'uint256' },
          { name: 'terms', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'methods',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
        internalType: 'struct IOffer.Limits',
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
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PexfiToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pexfiTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
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
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'value', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'burnFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
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
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PexfiVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pexfiVaultAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'asset_', internalType: 'contract PexfiToken', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxDeposit',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxMint',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxRedeem',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxWithdraw',
  },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidShortString' },
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
  {
    type: 'error',
    inputs: [{ name: 'str', internalType: 'string', type: 'string' }],
    name: 'StringTooLong',
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
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
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
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
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
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
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
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxMint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxWithdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'mint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'previewDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'previewMint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'previewWithdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PexfiVesting
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pexfiVestingAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'beneficiary', internalType: 'address', type: 'address' },
      { name: 'startTimestamp', internalType: 'uint64', type: 'uint64' },
      { name: 'durationSeconds', internalType: 'uint64', type: 'uint64' },
      { name: 'cliffSeconds', internalType: 'uint64', type: 'uint64' },
      { name: 'finder_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'FailedCall' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'InvalidArgument' },
  {
    type: 'error',
    inputs: [
      { name: 'cliffSeconds', internalType: 'uint64', type: 'uint64' },
      { name: 'durationSeconds', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'InvalidCliffDuration',
  },
  { type: 'error', inputs: [], name: 'InvlalidClaim' },
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
    inputs: [
      { name: 'bits', internalType: 'uint8', type: 'uint8' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'SafeCastOverflowedUintDowncast',
  },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ERC20Released',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EtherReleased',
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
    type: 'function',
    inputs: [
      { name: 'deal', internalType: 'address', type: 'address' },
      { name: 'claim', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'bond',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'cliff',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'duration',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'end',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'finder',
    outputs: [
      { name: '', internalType: 'contract FinderInterface', type: 'address' },
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
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'releasable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'releasable',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'released',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'released',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'start',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'token',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
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
    inputs: [{ name: 'timestamp', internalType: 'uint64', type: 'uint64' }],
    name: 'vestedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'vestedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Profile
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const profileAbi = [
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
  { type: 'error', inputs: [], name: 'FeedbackAlreadyGiven' },
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
  { type: 'error', inputs: [], name: 'ProfileAlreadyExists' },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnauthorizedAccount' },
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
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'info', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'UpdatedInfo',
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
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
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
    inputs: [],
    name: 'name',
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
    inputs: [],
    name: 'renounceOwnership',
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
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId_', internalType: 'uint256', type: 'uint256' },
      { name: 'info_', internalType: 'string', type: 'string' },
    ],
    name: 'updateInfo',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"fiatAmount"`
 */
export const useReadDealFiatAmount = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'fiatAmount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"isPaid"`
 */
export const useReadDealIsPaid = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'isPaid',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"offer"`
 */
export const useReadDealOffer = /*#__PURE__*/ createUseReadContract({
  abi: dealAbi,
  functionName: 'offer',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"assertionDisputedCallback"`
 */
export const useWriteDealAssertionDisputedCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: dealAbi,
    functionName: 'assertionDisputedCallback',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"assertionResolvedCallback"`
 */
export const useWriteDealAssertionResolvedCallback =
  /*#__PURE__*/ createUseWriteContract({
    abi: dealAbi,
    functionName: 'assertionResolvedCallback',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteDealInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: dealAbi,
  functionName: 'initialize',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"assertionDisputedCallback"`
 */
export const useSimulateDealAssertionDisputedCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealAbi,
    functionName: 'assertionDisputedCallback',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"assertionResolvedCallback"`
 */
export const useSimulateDealAssertionResolvedCallback =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealAbi,
    functionName: 'assertionResolvedCallback',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link dealAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateDealInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: dealAbi,
    functionName: 'initialize',
  })

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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"DisputeResolved"`
 */
export const useWatchDealDisputeResolvedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'DisputeResolved',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link dealAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchDealInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: dealAbi,
    eventName: 'Initialized',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"USDC"`
 */
export const useReadMarketUsdc = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'USDC',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"convert"`
 */
export const useReadMarketConvert = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'convert',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"deals"`
 */
export const useReadMarketDeals = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'deals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"disabledMethodsMask"`
 */
export const useReadMarketDisabledMethodsMask =
  /*#__PURE__*/ createUseReadContract({
    abi: marketAbi,
    functionName: 'disabledMethodsMask',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"fee"`
 */
export const useReadMarketFee = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"fiats"`
 */
export const useReadMarketFiats = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'fiats',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"finder"`
 */
export const useReadMarketFinder = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'finder',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"getPrice"`
 */
export const useReadMarketGetPrice = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'getPrice',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"methods"`
 */
export const useReadMarketMethods = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'methods',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"offers"`
 */
export const useReadMarketOffers = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'offers',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"tokens"`
 */
export const useReadMarketTokens = /*#__PURE__*/ createUseReadContract({
  abi: marketAbi,
  functionName: 'tokens',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addFiat"`
 */
export const useWriteMarketAddFiat = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addFiat',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addMethods"`
 */
export const useWriteMarketAddMethods = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addMethods',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addToken"`
 */
export const useWriteMarketAddToken = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'addToken',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"createOffer"`
 */
export const useWriteMarketCreateOffer = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'createOffer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"disableMethods"`
 */
export const useWriteMarketDisableMethods =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketAbi,
    functionName: 'disableMethods',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"enableMethods"`
 */
export const useWriteMarketEnableMethods = /*#__PURE__*/ createUseWriteContract(
  { abi: marketAbi, functionName: 'enableMethods' },
)

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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeFiat"`
 */
export const useWriteMarketRemoveFiat = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'removeFiat',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeToken"`
 */
export const useWriteMarketRemoveToken = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'removeToken',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setFee"`
 */
export const useWriteMarketSetFee = /*#__PURE__*/ createUseWriteContract({
  abi: marketAbi,
  functionName: 'setFee',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addFiat"`
 */
export const useSimulateMarketAddFiat = /*#__PURE__*/ createUseSimulateContract(
  { abi: marketAbi, functionName: 'addFiat' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addMethods"`
 */
export const useSimulateMarketAddMethods =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'addMethods',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"addToken"`
 */
export const useSimulateMarketAddToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'addToken',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"createOffer"`
 */
export const useSimulateMarketCreateOffer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'createOffer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"disableMethods"`
 */
export const useSimulateMarketDisableMethods =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'disableMethods',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"enableMethods"`
 */
export const useSimulateMarketEnableMethods =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'enableMethods',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeFiat"`
 */
export const useSimulateMarketRemoveFiat =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'removeFiat',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"removeToken"`
 */
export const useSimulateMarketRemoveToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketAbi,
    functionName: 'removeToken',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketAbi}__ and `functionName` set to `"setFee"`
 */
export const useSimulateMarketSetFee = /*#__PURE__*/ createUseSimulateContract({
  abi: marketAbi,
  functionName: 'setFee',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"FiatAdded"`
 */
export const useWatchMarketFiatAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'FiatAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"FiatRemoved"`
 */
export const useWatchMarketFiatRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'FiatRemoved',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"MethodAdded"`
 */
export const useWatchMarketMethodAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'MethodAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"MethodsDisabledMask"`
 */
export const useWatchMarketMethodsDisabledMaskEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'MethodsDisabledMask',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"TokenAdded"`
 */
export const useWatchMarketTokenAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'TokenAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketAbi}__ and `eventName` set to `"TokenRemoved"`
 */
export const useWatchMarketTokenRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketAbi,
    eventName: 'TokenRemoved',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"methods"`
 */
export const useReadOfferMethods = /*#__PURE__*/ createUseReadContract({
  abi: offerAbi,
  functionName: 'methods',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"createDeal"`
 */
export const useWriteOfferCreateDeal = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
  functionName: 'createDeal',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteOfferInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: offerAbi,
  functionName: 'initialize',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"createDeal"`
 */
export const useSimulateOfferCreateDeal =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerAbi,
    functionName: 'createDeal',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link offerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateOfferInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: offerAbi,
    functionName: 'initialize',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link offerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchOfferInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: offerAbi,
    eventName: 'Initialized',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__
 */
export const useReadPexfiToken = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadPexfiTokenDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiTokenAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadPexfiTokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadPexfiTokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadPexfiTokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadPexfiTokenEip712Domain =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiTokenAbi,
    functionName: 'eip712Domain',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadPexfiTokenName = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadPexfiTokenNonces = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadPexfiTokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: pexfiTokenAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadPexfiTokenTotalSupply = /*#__PURE__*/ createUseReadContract(
  { abi: pexfiTokenAbi, functionName: 'totalSupply' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__
 */
export const useWritePexfiToken = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiTokenAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWritePexfiTokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiTokenAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useWritePexfiTokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiTokenAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useWritePexfiTokenBurnFrom = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiTokenAbi,
  functionName: 'burnFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"permit"`
 */
export const useWritePexfiTokenPermit = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiTokenAbi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWritePexfiTokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiTokenAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWritePexfiTokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: pexfiTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__
 */
export const useSimulatePexfiToken = /*#__PURE__*/ createUseSimulateContract({
  abi: pexfiTokenAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulatePexfiTokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiTokenAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulatePexfiTokenBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiTokenAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"burnFrom"`
 */
export const useSimulatePexfiTokenBurnFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiTokenAbi,
    functionName: 'burnFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulatePexfiTokenPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiTokenAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulatePexfiTokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiTokenAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiTokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulatePexfiTokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiTokenAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiTokenAbi}__
 */
export const useWatchPexfiTokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pexfiTokenAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiTokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchPexfiTokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiTokenAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiTokenAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchPexfiTokenEip712DomainChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiTokenAbi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiTokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchPexfiTokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiTokenAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__
 */
export const useReadPexfiVault = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadPexfiVaultDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadPexfiVaultAllowance = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadPexfiVaultAsset = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'asset',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadPexfiVaultBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"convertToAssets"`
 */
export const useReadPexfiVaultConvertToAssets =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'convertToAssets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"convertToShares"`
 */
export const useReadPexfiVaultConvertToShares =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'convertToShares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadPexfiVaultDecimals = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadPexfiVaultEip712Domain =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'eip712Domain',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"maxDeposit"`
 */
export const useReadPexfiVaultMaxDeposit = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'maxDeposit',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"maxMint"`
 */
export const useReadPexfiVaultMaxMint = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'maxMint',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"maxRedeem"`
 */
export const useReadPexfiVaultMaxRedeem = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'maxRedeem',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"maxWithdraw"`
 */
export const useReadPexfiVaultMaxWithdraw = /*#__PURE__*/ createUseReadContract(
  { abi: pexfiVaultAbi, functionName: 'maxWithdraw' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"name"`
 */
export const useReadPexfiVaultName = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadPexfiVaultNonces = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadPexfiVaultOwner = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"previewDeposit"`
 */
export const useReadPexfiVaultPreviewDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'previewDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"previewMint"`
 */
export const useReadPexfiVaultPreviewMint = /*#__PURE__*/ createUseReadContract(
  { abi: pexfiVaultAbi, functionName: 'previewMint' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"previewRedeem"`
 */
export const useReadPexfiVaultPreviewRedeem =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'previewRedeem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"previewWithdraw"`
 */
export const useReadPexfiVaultPreviewWithdraw =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVaultAbi,
    functionName: 'previewWithdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadPexfiVaultSymbol = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVaultAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"totalAssets"`
 */
export const useReadPexfiVaultTotalAssets = /*#__PURE__*/ createUseReadContract(
  { abi: pexfiVaultAbi, functionName: 'totalAssets' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadPexfiVaultTotalSupply = /*#__PURE__*/ createUseReadContract(
  { abi: pexfiVaultAbi, functionName: 'totalSupply' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__
 */
export const useWritePexfiVault = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"approve"`
 */
export const useWritePexfiVaultApprove = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWritePexfiVaultDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"mint"`
 */
export const useWritePexfiVaultMint = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"permit"`
 */
export const useWritePexfiVaultPermit = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"redeem"`
 */
export const useWritePexfiVaultRedeem = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'redeem',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWritePexfiVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pexfiVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"transfer"`
 */
export const useWritePexfiVaultTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWritePexfiVaultTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: pexfiVaultAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWritePexfiVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pexfiVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWritePexfiVaultWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVaultAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__
 */
export const useSimulatePexfiVault = /*#__PURE__*/ createUseSimulateContract({
  abi: pexfiVaultAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulatePexfiVaultApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulatePexfiVaultDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulatePexfiVaultMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulatePexfiVaultPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"redeem"`
 */
export const useSimulatePexfiVaultRedeem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'redeem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulatePexfiVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulatePexfiVaultTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulatePexfiVaultTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulatePexfiVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulatePexfiVaultWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVaultAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__
 */
export const useWatchPexfiVaultEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pexfiVaultAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchPexfiVaultApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVaultAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchPexfiVaultDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVaultAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchPexfiVaultEip712DomainChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVaultAbi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchPexfiVaultOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVaultAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchPexfiVaultTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVaultAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVaultAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchPexfiVaultWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVaultAbi,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__
 */
export const useReadPexfiVesting = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"cliff"`
 */
export const useReadPexfiVestingCliff = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'cliff',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"duration"`
 */
export const useReadPexfiVestingDuration = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'duration',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"end"`
 */
export const useReadPexfiVestingEnd = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'end',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"finder"`
 */
export const useReadPexfiVestingFinder = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'finder',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"owner"`
 */
export const useReadPexfiVestingOwner = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"releasable"`
 */
export const useReadPexfiVestingReleasable =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVestingAbi,
    functionName: 'releasable',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"released"`
 */
export const useReadPexfiVestingReleased = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'released',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"start"`
 */
export const useReadPexfiVestingStart = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'start',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"token"`
 */
export const useReadPexfiVestingToken = /*#__PURE__*/ createUseReadContract({
  abi: pexfiVestingAbi,
  functionName: 'token',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"vestedAmount"`
 */
export const useReadPexfiVestingVestedAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: pexfiVestingAbi,
    functionName: 'vestedAmount',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVestingAbi}__
 */
export const useWritePexfiVesting = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVestingAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"bond"`
 */
export const useWritePexfiVestingBond = /*#__PURE__*/ createUseWriteContract({
  abi: pexfiVestingAbi,
  functionName: 'bond',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"release"`
 */
export const useWritePexfiVestingRelease = /*#__PURE__*/ createUseWriteContract(
  { abi: pexfiVestingAbi, functionName: 'release' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWritePexfiVestingRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pexfiVestingAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWritePexfiVestingTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: pexfiVestingAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVestingAbi}__
 */
export const useSimulatePexfiVesting = /*#__PURE__*/ createUseSimulateContract({
  abi: pexfiVestingAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"bond"`
 */
export const useSimulatePexfiVestingBond =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVestingAbi,
    functionName: 'bond',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"release"`
 */
export const useSimulatePexfiVestingRelease =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVestingAbi,
    functionName: 'release',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulatePexfiVestingRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVestingAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link pexfiVestingAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulatePexfiVestingTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: pexfiVestingAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVestingAbi}__
 */
export const useWatchPexfiVestingEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: pexfiVestingAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVestingAbi}__ and `eventName` set to `"ERC20Released"`
 */
export const useWatchPexfiVestingErc20ReleasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVestingAbi,
    eventName: 'ERC20Released',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVestingAbi}__ and `eventName` set to `"EtherReleased"`
 */
export const useWatchPexfiVestingEtherReleasedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVestingAbi,
    eventName: 'EtherReleased',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link pexfiVestingAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchPexfiVestingOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: pexfiVestingAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__
 */
export const useReadProfile = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadProfileUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: profileAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadProfileBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadProfileGetApproved = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'getApproved',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadProfileIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: profileAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"name"`
 */
export const useReadProfileName = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"owner"`
 */
export const useReadProfileOwner = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadProfileOwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"ownerToTokenId"`
 */
export const useReadProfileOwnerToTokenId = /*#__PURE__*/ createUseReadContract(
  { abi: profileAbi, functionName: 'ownerToTokenId' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadProfileProxiableUuid = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'proxiableUUID',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadProfileSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: profileAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadProfileSymbol = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadProfileTokenUri = /*#__PURE__*/ createUseReadContract({
  abi: profileAbi,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__
 */
export const useWriteProfile = /*#__PURE__*/ createUseWriteContract({
  abi: profileAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteProfileApprove = /*#__PURE__*/ createUseWriteContract({
  abi: profileAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteProfileInitialize = /*#__PURE__*/ createUseWriteContract({
  abi: profileAbi,
  functionName: 'initialize',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"register"`
 */
export const useWriteProfileRegister = /*#__PURE__*/ createUseWriteContract({
  abi: profileAbi,
  functionName: 'register',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteProfileRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: profileAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteProfileSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: profileAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteProfileSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: profileAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteProfileTransferFrom = /*#__PURE__*/ createUseWriteContract(
  { abi: profileAbi, functionName: 'transferFrom' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteProfileTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: profileAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"updateInfo"`
 */
export const useWriteProfileUpdateInfo = /*#__PURE__*/ createUseWriteContract({
  abi: profileAbi,
  functionName: 'updateInfo',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteProfileUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: profileAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__
 */
export const useSimulateProfile = /*#__PURE__*/ createUseSimulateContract({
  abi: profileAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateProfileApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateProfileInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"register"`
 */
export const useSimulateProfileRegister =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'register',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateProfileRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateProfileSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateProfileSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateProfileTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateProfileTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"updateInfo"`
 */
export const useSimulateProfileUpdateInfo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'updateInfo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link profileAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateProfileUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: profileAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__
 */
export const useWatchProfileEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: profileAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchProfileApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchProfileApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchProfileInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchProfileOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchProfileTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"UpdatedInfo"`
 */
export const useWatchProfileUpdatedInfoEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
    eventName: 'UpdatedInfo',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link profileAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchProfileUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: profileAbi,
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
