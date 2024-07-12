Summary
=======

[Live Arbitrum Sepolia Demo](https://marketdapp.github.io)

The platform enables users to trade ERC20 tokens on EVM-compatible chains, operating fully on-chain.  
With the adoption of L2 networks like Arbitrum, it's now possible to run entire websites on-chain.

This is a non-custodial platform — we do not hold any funds or tokens.  
Mediators involved in dispute resolution can only direct tokens to one of the trade participants.

Motivation
==========

As of mid-2024 there are no exchanges allowing users to trade ERC20 tokens for fiat peer-to-peer in non-custodial manner.  
Existing solutions are CEX'es who provide custody of user's funds and hence obliged to comply with financial regulations.  
Such tendency makes crypto centralized, subject to censorship and reliance on a trusted accounts manager, very similar to traditional banking, if not say the same.  
Having your crypto on a CEX is contrary to the original idea of peer-to-peer cash as described by Satoshi Nakamoto.

This project is an attempt to provide users an easy to use interface to publish their own smart contracts on-chain so that others can transact with them using local fiat currency.  
Mediation of disputes is at the moment is done by project admins. In the next stage a proof-of-stake protocol will be implemented to further decentralize the platform and let users to choose their mediators from a pool of mediators who are financially incentivized to behave fairly.

The ultimate goal is to provide a secure decentralized way to ensure trades are completed and buyers and sellers can find each other.  
As this is non-custodial solution we do not touch money in any way, therefore not subject to mandatory KYC/AML screening of our users.  
Tokens are escrowed in user's contract and mediators are only able to send it to either direction and not elsewhere.

Features
========

- Creation of buy or sell offers as smart contracts, listed by token, fiat currency, and payment method.
- Decentralized dispute mediation.
- Fully on-chain messaging.
- Reputation system for traders. (It's NFT!)

Call to Action
==============

Our platform is still in development, and there's much more to achieve. Our current milestones are:

1. Professional design for the client-side React app.
2. Security audit for the smart contracts, with plans to publish them as open-source.
3. On-chain encryption for messaging.
4. Facilitating regulatory compliance (KYC) for traders, if requested.
