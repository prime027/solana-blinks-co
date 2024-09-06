import { useWallet } from '@solana/wallet-adapter-react';
import SendMemoButton from './SendTransactionButtons/SendMemo';
import Balance from './Balance';

const Main = () => {
    const { connected } = useWallet();
    return (
        <div className="flex flex-col items-center justify-between p-24">
            {connected ?
                <div className="flex flex-col items-center justify-center">
                    <Balance />
                    <SendMemoButton message= 'Hello from Prime'/>
                </div>
                :
                <div>Wallet Not Connected</div>}
        </div>
    )
}
export default Main;
