const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))
// users/customer
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'details.html'));
});
// admin/manufcaturer 
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.post('/products', async (req, res) => {
    try {
        const { id, name, description, price } = req.body;
        const result = await submitTransaction('CreateProduct', id, name, description, price);
        res.status(204).send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await evaluateTransaction('ReadProduct', id);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(404).send(`Failed to evaluate transaction: ${error}`);
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const result = await submitTransaction('UpdateProduct', id, name, description, price);
        res.status(204).send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await submitTransaction('DeleteProduct', id);
        res.send(result);
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).send(`Failed to submit transaction: ${error}`);
    }
});
app.get('/products', async (req, res) => {
    try {
        const result = await evaluateTransaction('GetAllProducts');
        res.status(200).send(result);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).send(`Failed to evaluate transaction: ${error}`);
    }
});

async function getContract() {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get('Admin@supplychain.com');
    const gateway = new Gateway();
    const connectionProfile = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'connection.json'), 'utf8'));
    const connectionOptions = { wallet, identity: identity, discovery: { enabled: false, asLocalhost: true } };
    await gateway.connect(connectionProfile, connectionOptions);
    const network = await gateway.getNetwork('supplychainchannel');
    const contract = network.getContract('supplymgt');
    return contract;
}

async function submitTransaction(functionName, ...args) {
    const contract = await getContract();
    const result = await contract.submitTransaction(functionName, ...args);
    return result.toString();
}

async function evaluateTransaction(functionName, ...args) {
    const contract = await getContract();
    const result = await contract.evaluateTransaction(functionName, ...args);
    return result.toString();
}

app.get('/', (req, res) => {
    res.send('Hello, World!');
});


module.exports = app;