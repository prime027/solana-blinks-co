import {
    Connection,
    PublicKey,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    TransactionInstruction,
    Keypair,
    sendAndConfirmTransaction
} from "@solana/web3.js";

const quickNodeEndpoint = 'https://devnet.helius-rpc.com/?api-key=ad99805d-0ce2-4769-96ef-3d68a34efb2d' // 👈 REPLACE THIS WITH YOUR ENDPOINT
const connection = new Connection(quickNodeEndpoint);

async function sendTransaction() {
    // Define Keys
    const receiver = Keypair.generate();
    // 👇 Replace the secret with your own
    const secret = [238,247,215,222,17,233,221,210,51,20,8,185,74,86,65,195,193,58,9,244,20,195,216,150,168,224,120,141,149,147,149,231,69,92,152,69,223,163,47,215,150,102,249,227,224,233,125,41,244,245,218,90,67,96,175,39,219,155,215,23,88,115,60,154]
    const sender = Keypair.fromSecretKey(new Uint8Array(secret));
    console.log(`Receiver Address: ${receiver.publicKey.toBase58()}`);

    // Create Instruction
    const ix: TransactionInstruction = SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver.publicKey,
        lamports: LAMPORTS_PER_SOL / 10
    })

    // Create and Prepare Transaction
    const transaction = new Transaction().add(ix);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.feePayer = sender.publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.sign(sender);

    // Send and Confirm Transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [sender]);
    console.log(`Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log(`Blockhash: ${blockhash}`);
}
sendTransaction().then(() => process.exit());