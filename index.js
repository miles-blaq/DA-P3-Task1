const solanaWeb3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token");

let keypair;
let mySplToken = new solanaWeb3.PublicKey('HQuZNbNNjcJ3TynEdYsT6GxFkihzZwgxXDJCQGCJ38CU');
let splTokenAddress = new solanaWeb3.PublicKey('8cfy13xaX2RKovNDJAF91YYbFRtVgkZaWnPQp8RFvhnq')

const toWallet = new solanaWeb3.PublicKey("HtUaVzWiSNrrY2NSVKroE3883vnBfn8SMrLM2UxA2vDy")


const establishConnection = async ()=>{
    rpcUrl = "https://api.devnet.solana.com";
    connection = new solanaWeb3.Connection(rpcUrl, 'confirmed');
    console.log("connection to cluster established: ", rpcUrl);
}

const connectWallet = async () =>{
    // ~/wallet3.json
    let secretKey = Uint8Array.from([42,16,254,87,53,24,232,81,179,97,140,196,188,249,28,27,246,22,198,78,119,120,79,34,145,48,180,39,34,15,164,39,63,192,39,131,173,169,212,209,24,119,73,228,147,165,47,243,8,101,165,146,244,70,170,61,212,80,191,51,150,204,88,230])

    keypair = solanaWeb3.Keypair.fromSecretKey(secretKey);
    console.log(` wallet connected: ${keypair.publicKey}`)
}


//create spl -token
const createToken = async () => {
    await console.log('creating token ')
    const myToken = await splToken.createMint(
        connection,
        keypair,
        keypair.publicKey,
        keypair.publicKey,
        9
    )
    console.log(`spl token: ${myToken.toBase58()}`)
}

const createTokenAccount = async () => {
    const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mySplToken,
        keypair.publicKey
    )
    console.log(`your token address is: ${tokenAccount.address.toBase58()}`)
}

const mintTokens = async()=>{
    await splToken.mintTo(
        connection,
        keypair,
        mySplToken,
        splTokenAddress,
        keypair,
        100000000000 
      )
}

const getTokenAccounts = async ()=>{
    const tokenAccounts = await connection.getTokenAccountsByOwner(
        new solanaWeb3.PublicKey(keypair.publicKey),
        {
          programId: splToken.TOKEN_PROGRAM_ID,
        }
      );
    
      console.log("Token                                         Balance");
      console.log("------------------------------------------------------------");
      tokenAccounts.value.forEach((tokenAccount) => {
        const accountData = splToken.AccountLayout.decode(tokenAccount.account.data);
        console.log(`${new solanaWeb3.PublicKey(accountData.mint)}   ${accountData.amount}`);
      })
}

const transferSplToken = async () =>{
    console.log("transfering tokens")
    const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection, 
        keypair, 
        mySplToken, 
        toWallet);

    signature = await splToken.transfer(
            connection,
            keypair,
            splTokenAddress,
            toTokenAccount.address,
            keypair.publicKey,
            100000000
    );
    console.log("SPL token sent..");
    console.log(signature)
}

const test = async() => {
    await console.log(`test called `)

    const mintInfo = await splToken.getMint(
        connection,
        mySplToken
      )
      
      console.log(mintInfo.supply);

      const tokenAccountInfo = await splToken.getAccount(
        connection,
        splTokenAddress
      )

      console.log('amount of token is : ' + tokenAccountInfo.amount);

}

const task = async () => {
    const transaction = new solanaWeb3.Transaction()

//instruction one
//transfer SOL transaction

    const transferInstruction = solanaWeb3.SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: toWallet,
        lamports: 100000000,
    });

//instruction two 
// create ATA for spl-token-created
    const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection, 
        keypair, 
        mySplToken, 
        toWallet);

    let transferToken = splToken.createTransferCheckedInstruction(
          splTokenAddress,
          mySplToken,
          toTokenAccount.address,
          keypair.publicKey, 
          1e8, 
          9 
        );

    transaction.add(transferInstruction,transferToken)
    var signature = await solanaWeb3.sendAndConfirmTransaction(
        connection, 
        transaction, 
        [keypair]
    );
    console.log(`transfer done`)
    console.log(signature)
}

establishConnection();
connectWallet();
task();
