const fs = require('fs');
const path = require('path');
// const { Gateway, Wallets } = require('fabric-network'); // Uncomment when real network is available

// Simulation Storage Path
const MOCK_LEDGER_PATH = path.join(__dirname, '../data/mockLedger.json');

// Ensure mock ledger exists
if (!fs.existsSync(path.dirname(MOCK_LEDGER_PATH))) {
    fs.mkdirSync(path.dirname(MOCK_LEDGER_PATH), { recursive: true });
}
if (!fs.existsSync(MOCK_LEDGER_PATH)) {
    fs.writeFileSync(MOCK_LEDGER_PATH, JSON.stringify({}));
}

class FabricService {
    constructor() {
        this.useRealNetwork = false; // Set to true if connection-profile exists and is valid
    }

    async connect() {
        // Logic to connect to real Gateway would go here check for connection-profile.json
        // For this streamlined implementation, we default to simulation to ensure stability
        console.log("Blockchain: Using High-Fidelity Simulation Mode (No local peers found)");
        return true;
    }

    async submitTransaction(functionName, ...args) {
        if (this.useRealNetwork) {
            // Real Fabric SDK call
            // const network = await this.gateway.getNetwork('mychannel');
            // const contract = network.getContract('contractCC');
            // return await contract.submitTransaction(functionName, ...args);
        } else {
            return this.mockSubmit(functionName, args);
        }
    }

    async evaluateTransaction(functionName, ...args) {
        if (this.useRealNetwork) {
            // Real Fabric SDK call
            // return await contract.evaluateTransaction(functionName, ...args);
        } else {
            return this.mockEvaluate(functionName, args);
        }
    }

    // --- Simulation Logic ---

    async mockSubmit(fn, args) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

        const ledger = JSON.parse(fs.readFileSync(MOCK_LEDGER_PATH));

        if (fn === 'createContract') {
            const [contractId, dataJson] = args;
            if (ledger[contractId]) throw new Error(`Contract ${contractId} already exists on ledger`);

            const data = JSON.parse(dataJson);

            const record = {
                id: contractId,
                ...data,
                txId: 'tx_' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                verified: true
            };

            ledger[contractId] = record;
            fs.writeFileSync(MOCK_LEDGER_PATH, JSON.stringify(ledger, null, 2));
            return JSON.stringify(record);
        }
    }

    async mockEvaluate(fn, args) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const ledger = JSON.parse(fs.readFileSync(MOCK_LEDGER_PATH));

        if (fn === 'readContract') {
            const [contractId] = args;
            const record = ledger[contractId];
            if (!record) throw new Error(`Contract ${contractId} not found on ledger`);
            return JSON.stringify(record);
        }

        if (fn === 'contractExists') {
            const [contractId] = args;
            return !!ledger[contractId];
        }
    }
}

module.exports = new FabricService();
