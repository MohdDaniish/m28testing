require('dotenv').config();
const { ethers } = require('ethers');
const Safe = require('@safe-global/protocol-kit').default;
const { EthersAdapter } = require('@safe-global/protocol-kit');
const SafeApiKit = require('@safe-global/api-kit').default;

async function sendToMultipleRecipients(recipients) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer,
    });

    const safeSdk = await Safe.create({ ethAdapter, safeAddress: process.env.SAFE_ADDRESS });

    const safeApiKit = new SafeApiKit({
        txServiceUrl: 'https://safe-transaction-mumbai.safe.global', // Mumbai Safe Transaction Service
        ethAdapter
    });

    const transactions = recipients.map((recipient) => ({
        to: recipient.address,
        data: '0x',
        value: ethers.utils.parseEther(recipient.amount.toString()).toString(),
    }));

    const safeTransactionData = await safeSdk.createTransaction({ safeTransactionData: transactions });

    const signedTransaction = await safeSdk.signTransaction(safeTransactionData);

    const safeTxHash = await safeApiKit.proposeTransaction({
        safeAddress: process.env.SAFE_ADDRESS,
        safeTransactionData: safeTransactionData.data,
        safeTxHash: await safeSdk.getTransactionHash(safeTransactionData),
        senderAddress: await signer.getAddress(),
        senderSignature: signedTransaction.signature.data,
    });

    console.log('Transaction proposed successfully:', safeTxHash);
}

// Example Usage:
const recipients = [
    { address: '0xRecipientAddress1...', amount: 0.01 },
    { address: '0xRecipientAddress2...', amount: 0.02 }
];

sendToMultipleRecipients(recipients);
