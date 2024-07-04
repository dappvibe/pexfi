import { PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react'
import {message} from "antd";

type SelectedAccountByWallet = Record<string, string | null>

interface WalletProviderContext {
    wallets: Record<string, EIP6963ProviderDetail>         // Record of wallets by UUID
    wallet: EIP6963ProviderDetail | null           // Currently selected wallet
    account: string | null                         // Account address of selected wallet
    errorMessage: string | null                            // Error message
    connectWallet: (walletUuid: string) => Promise<void>   // Function to trigger wallet connection
    disconnectWallet: () => void                           // Function to trigger wallet disconnection
    clearError: () => void                                 // Function to clear error message
}

declare global{
    interface WindowEventMap {
        'eip6963:announceProvider': CustomEvent
    }
}

export const WalletProviderContext = createContext<WalletProviderContext>(null)

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [wallets, setWallets] = useState<Record<string, EIP6963ProviderDetail>>({})
    const [selectedWalletRdns, setSelectedWalletRdns] = useState<string | null>(null)
    const [selectedAccountByWalletRdns, setSelectedAccountByWalletRdns] = useState<SelectedAccountByWallet>({})

    const [errorMessage, setErrorMessage] = useState('')
    const clearError = () => setErrorMessage('')
    const setError = (error: string) => setErrorMessage(error)

    useEffect(() => {
        const savedSelectedWalletRdns = localStorage.getItem('selectedWalletRdns')
        const savedSelectedAccountByWalletRdns = localStorage.getItem('selectedAccountByWalletRdns')

        if (savedSelectedAccountByWalletRdns) {
            setSelectedAccountByWalletRdns(JSON.parse(savedSelectedAccountByWalletRdns))
        }

        function onAnnouncement(event: EIP6963AnnounceProviderEvent){
            setWallets(currentWallets => ({
                ...currentWallets,
                [event.detail.info.rdns]: event.detail
            }))

            if (savedSelectedWalletRdns && event.detail.info.rdns === savedSelectedWalletRdns) {
                setSelectedWalletRdns(savedSelectedWalletRdns)
                event.detail.provider.on('accountsChanged', (accounts: string[]) => updateAccounts(savedSelectedWalletRdns, accounts));
            }
        }

        window.addEventListener('eip6963:announceProvider', onAnnouncement)
        window.dispatchEvent(new Event('eip6963:requestProvider'))

        return () => {
            window.removeEventListener('eip6963:announceProvider', onAnnouncement);
        }
    }, [])

    function updateAccounts(rdns: string, accounts: string[]) {
        setSelectedWalletRdns(rdns)
        setSelectedAccountByWalletRdns((currentAccounts) => ({
            ...currentAccounts,
            [rdns]: accounts[0],
        }))

        localStorage.setItem('selectedWalletRdns', rdns)
        localStorage.setItem('selectedAccountByWalletRdns', JSON.stringify({
            ...selectedAccountByWalletRdns,
            [rdns]: accounts[0],
        }))
    }

    const connectWallet = useCallback(async (walletRdns: string) => {
        try {
            const wallet = wallets[walletRdns]
            const accounts = await wallet.provider.request({method:'eth_requestAccounts'}) as string[]

            if(accounts?.[0]) {
                updateAccounts(wallet.info.rdns, accounts);
            }
        } catch (error) {
            message.error(error.message);
            const walletError: WalletError = error as WalletError
            setError(`Code: ${walletError.code} \nError Message: ${walletError.message}`)
        }
    }, [wallets, selectedAccountByWalletRdns])

    const disconnectWallet = useCallback(async () => {
        if (selectedWalletRdns) {
            setSelectedAccountByWalletRdns((currentAccounts) => ({
                ...currentAccounts,
                [selectedWalletRdns]: null,
            }))

            const wallet = wallets[selectedWalletRdns];
            setSelectedWalletRdns(null)
            localStorage.removeItem('selectedWalletRdns')

            try {
                await wallet.provider.request({
                    method: 'wallet_revokePermissions',
                    params: [{ 'eth_accounts': {} }]
                });
            } catch (error) {
                console.error('Failed to revoke permissions:', error);
            }
        }
    }, [selectedWalletRdns, wallets])

    const contextValue: WalletProviderContext = {
        wallets,
        wallet: selectedWalletRdns === null ? null : wallets[selectedWalletRdns],
        account: selectedWalletRdns === null ? null : selectedAccountByWalletRdns[selectedWalletRdns],
        errorMessage,
        connectWallet,
        disconnectWallet,
        clearError,
    }

    return (
        <WalletProviderContext.Provider value={contextValue}>
            {children}
        </WalletProviderContext.Provider>
    )
}
