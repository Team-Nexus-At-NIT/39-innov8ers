'use strict';

const { Contract } = require('fabric-contract-api');

class ContractFarmingContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    async contractExists(ctx, contractId) {
        const buffer = await ctx.stub.getState(contractId);
        return (!!buffer && buffer.length > 0);
    }

    async createContract(ctx, contractId, dataJson) {
        console.info('============= START : Create Contract ===========');
        const exists = await this.contractExists(ctx, contractId);
        if (exists) {
            throw new Error(`The contract ${contractId} already exists`);
        }

        const data = JSON.parse(dataJson);

        // Enforce Schema: ONLY store the 6 allowed fields
        const contractAsset = {
            docType: 'contract',
            id: contractId,
            expiryDate: data.expiryDate,
            cropType: data.cropType,
            priceGuarantee: data.priceGuarantee,
            companyDetails: data.companyDetails,
            paymentSchedule: data.paymentSchedule,
            timestamp: new Date().toISOString(),
            integrityHash: data.integrityHash // Optional: Hash of the full off-chain document
        };

        const buffer = Buffer.from(JSON.stringify(contractAsset));
        await ctx.stub.putState(contractId, buffer);
        console.info('============= END : Create Contract ===========');
        return JSON.stringify(contractAsset);
    }

    async readContract(ctx, contractId) {
        const exists = await this.contractExists(ctx, contractId);
        if (!exists) {
            throw new Error(`The contract ${contractId} does not exist`);
        }
        const buffer = await ctx.stub.getState(contractId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
}

module.exports = ContractFarmingContract;
