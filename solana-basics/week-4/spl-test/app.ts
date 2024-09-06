import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import {
    getOrCreateAssociatedTokenAccount, 
    getMinimumBalanceForRentExemptMint, 
    getAssociatedTokenAddressSync, 
    MINT_SIZE, TOKEN_PROGRAM_ID, 
    createInitializeMintInstruction, 
    createMintToInstruction, 
    createAssociatedTokenAccountIdempotentInstruction, 
    transfer,
    burnChecked 
} from "@solana/spl-token";


const secret = [238,247,215,222,17,233,221,210,51,20,8,185,74,86,65,195,193,58,9,244,20,195,216,150,168,224,120,141,149,147,149,231,69,92,152,69,223,163,47,215,150,102,249,227,224,233,125,41,244,245,218,90,67,96,175,39,219,155,215,23,88,115,60,154]
const tokenAUthority = Keypair.fromSecretKey(new Uint8Array(secret));
const receiver = Keypair.generate();

const quickNodeEndpoint = 'https://devnet.helius-rpc.com/?api-key=ad99805d-0ce2-4769-96ef-3d68a34efb2d'
const connection = new Connection(quickNodeEndpoint);


async function createNewToken(authority: Keypair, connection: Connection, numDecimals: number) {

    const requiredBalance = await getMinimumBalanceForRentExemptMint(connection);
    const mintkeypair = Keypair.generate();
    const ix1 = SystemProgram.createAccount({
        fromPubkey: authority.publicKey,
        newAccountPubkey: mintkeypair.publicKey,
        space: MINT_SIZE,
        lamports: requiredBalance,
        programId: TOKEN_PROGRAM_ID,
    });


    const ix2 = createInitializeMintInstruction(
        mintkeypair.publicKey,
        numDecimals,
        authority.publicKey,
        authority.publicKey
    );

    const createNewTokenTransaction =new Transaction().add(ix1, ix2);
    const initSignature = await sendAndConfirmTransaction(connection, createNewTokenTransaction, [tokenAUthority, mintkeypair]);
    return { initSignature, mint: mintkeypair.publicKey };
}

async function main() {
    const { initSignature, mint } = await createNewToken(tokenAUthority, connection, 0);
    console.log(`Init Token Tx: https://explorer.solana.com/tx/${initSignature}?cluster=devnet`);
    console.log(`Mint ID: ${mint.toBase58()}`);

    const { mintSignature } = await mintTokens(mint, tokenAUthority, connection, 100);
    console.log(`Mint Tokens Tx: https://explorer.solana.com/tx/${mintSignature}?cluster=devnet`);

    const { transferSignature } = await transferTokens(mint, tokenAUthority, receiver.publicKey, connection, 1);
    console.log(`Transfer Tokens Tx: https://explorer.solana.com/tx/${transferSignature}?cluster=devnet`);

    const { burnSignature } = await burnTokens(mint, tokenAUthority, connection, 1, 0);
    console.log(`Burn Tokens Tx: https://explorer.solana.com/tx/${burnSignature}?cluster=devnet`);

}

main()
    .then(() => process.exit())
    .catch((err) => {
        console.log(err);
        process.exit(-1);
    });

async function mintTokens(mint: PublicKey, authority: Keypair, connection: Connection, numTokens: number) {
     // Instruction 1 - Create a new token account
     const tokenATA = getAssociatedTokenAddressSync(mint, authority.publicKey);
     const ix1 = createAssociatedTokenAccountIdempotentInstruction(
        authority.publicKey,
        tokenATA,
        authority.publicKey,
        mint
     );

     // Instruction 2 - Mint tokens to the new account
     const ix2 = createMintToInstruction(
        mint,
        tokenATA,
        authority.publicKey,
        numTokens
     );

     // create and send transaction
     const mintTokensTransaction = new Transaction().add (ix1, ix2);
     const mintSignature = await sendAndConfirmTransaction(connection, mintTokensTransaction, [tokenAUthority], { skipPreflight: true });
     return { mintSignature };
}

async function transferTokens(mint: PublicKey, authority: Keypair, destination: PublicKey, connection: Connection, numTokens: number) {
    const destinationAta = await getOrCreateAssociatedTokenAccount(connection, authority, mint, destination, undefined, undefined, { skipPreflight: true});
    const sourceAta = await getOrCreateAssociatedTokenAccount(connection, authority, mint, authority.publicKey, undefined, undefined, { skipPreflight: true});
    const transferSignature = await transfer(connection, authority, sourceAta.address, destinationAta.address, authority, numTokens)
    return { transferSignature};
}

async function burnTokens(mint: PublicKey, authority: Keypair, connection: Connection, numberTokens: number, decimals: number) {
    const ata = await getOrCreateAssociatedTokenAccount( connection, authority, mint, authority.publicKey, undefined, undefined, { skipPreflight: true });
    const burnSignature = await burnChecked(
        connection,
        authority,
        ata.address,
        mint,
        authority.publicKey,
        numberTokens,
        decimals,
        undefined,
        { skipPreflight: true }
    );
    return { burnSignature };
}