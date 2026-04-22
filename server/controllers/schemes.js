const Scheme = require('../models/Scheme');

// Get all schemes
exports.getSchemes = async (req, res) => {
    try {
        const { category } = req.query;
        let query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }

        const schemes = await Scheme.find(query).sort({ createdAt: -1 });
        res.status(200).json(schemes);
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ message: 'Server error fetching schemes' });
    }
};

// Seed initial data
exports.seedSchemes = async (req, res) => {
    try {
        const sampleSchemes = [
            {
                title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
                provider: 'Central Govt',
                description: 'Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.',
                benefits: [
                    'Lowest premium rates for farmers',
                    'Full sum insured coverage',
                    'Post-harvest loss coverage'
                ],
                eligibility: [
                    'All farmers growing notified crops',
                    'Sharecroppers and tenant farmers eligible'
                ],
                applicationLink: 'https://pmfby.gov.in/',
                category: 'Insurance'
            },
            {
                title: 'PM-KISAN Samman Nidhi',
                provider: 'Central Govt',
                description: 'Income support of Rs. 6000/- per year to all landholding farmer families.',
                benefits: [
                    'Direct Benefit Transfer (DBT)',
                    'Rs. 6000 per year in 3 installments',
                    'No intermediaries'
                ],
                eligibility: [
                    'Small and marginal farmers',
                    'Valid landholding required'
                ],
                applicationLink: 'https://pmkisan.gov.in/',
                category: 'Subsidy'
            },
            {
                title: 'Kisan Credit Card (KCC) Scheme',
                provider: 'RBI / Central Govt',
                description: 'Provides adequate and timely credit support from the banking system to the farmers for their cultivation and other needs.',
                benefits: [
                    'Credit for cultivation expenses',
                    'Investment credit for agriculture',
                    'Consumption requirements'
                ],
                eligibility: [
                    'Individual farmers',
                    'Self Help Groups (SHGs)',
                    'Joint Liability Groups (JLGs)'
                ],
                applicationLink: 'https://www.myscheme.gov.in/schemes/kcc',
                category: 'Credit'
            },
            {
                title: 'Soil Health Card Scheme',
                provider: 'Ministry of Agriculture',
                description: 'A scheme to issue soil health cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers.',
                benefits: [
                    'Balanced use of fertilizers',
                    'Low cost farming',
                    'Higher yield per acre'
                ],
                eligibility: [
                    'All farmers'
                ],
                applicationLink: 'https://www.soilhealth.dac.gov.in/',
                category: 'Training'
            },
            {
                title: 'Agriculture Infrastructure Fund',
                provider: 'Central Govt',
                description: 'Financing facility for investment in viable projects for post-harvest management infrastructure.',
                benefits: [
                    'Interest subvention of 3%',
                    'Credit guarantee coverage',
                    'Loan up to 2 Crores'
                ],
                eligibility: [
                    'Primary Agricultural Credit Societies',
                    'Marketing Cooperative Societies',
                    'FPOs'
                ],
                applicationLink: 'https://agriinfra.dac.gov.in/',
                category: 'Infrastructure'
            }
        ];

        // Clear existing and insert new
        await Scheme.deleteMany({});
        await Scheme.insertMany(sampleSchemes);

        console.log(`Schemes seeded successfully: ${sampleSchemes.length} records`);

        // Check if res exists (for API call vs execution by server.js)
        if (res && typeof res.status === 'function') {
            res.status(201).json({ message: 'Schemes seeded successfully', count: sampleSchemes.length });
        }
    } catch (error) {
        console.error('Error seeding schemes:', error);
        // Check if res exists
        if (res && typeof res.status === 'function') {
            res.status(500).json({ message: 'Server error seeding schemes' });
        }
    }
};
// Sync with External Government Portal (Simulated Real-Time)
exports.syncSchemes = async (req, res) => {
    try {
        console.log("Syncing with Ministry of Agriculture Portal...");

        // 1. Simulate Network Delay for "Real-Time" feel
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newLoanSchemes = [
            {
                title: 'Kisan Tatkal Loan Scheme',
                provider: 'State Bank of India / Govt',
                description: 'Emergency credit support for farmers to meet immediate cultivation and household needs during harvest season.',
                benefits: [
                    'Instant approval within 24 hours',
                    'No collateral up to ₹1.6 Lakhs',
                    'Minimal documentation'
                ],
                eligibility: ['Existing KCC holders', 'Good repayment track record'],
                applicationLink: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-tatkal-scheme',
                category: 'Loan',
                isActive: true
            },
            {
                title: 'Agri-Gold Loan Facility',
                provider: 'Nationalized Banks',
                description: 'Low-interest loans against gold ornaments for agricultural purposes with flexible repayment options.',
                benefits: [
                    'Interest rate as low as 7%',
                    'Higher per-gram value',
                    'Quick disbursement'
                ],
                eligibility: ['Farmers owning gold ornaments', 'Proof of agricultural land'],
                applicationLink: 'https://www.myscheme.gov.in/schemes',
                category: 'Loan',
                isActive: true
            },
            {
                title: 'Farm Mechanization Loan',
                provider: 'NABARD',
                description: 'Term loan for purchase of tractors, power tillers, and other farm machinery to modernize operations.',
                benefits: [
                    'Repayment up to 9 years',
                    'Margin money only 15-20%',
                    'Hypothecation of machinery as security'
                ],
                eligibility: ['Individual farmers', 'Joint borrowers', 'SHGs'],
                applicationLink: 'https://www.nabard.org/',
                category: 'Loan',
                isActive: true
            }
        ];

        // Upsert logic: Check if exists by title, if not insert
        let addedCount = 0;
        for (const scheme of newLoanSchemes) {
            const exists = await Scheme.findOne({ title: scheme.title });
            if (!exists) {
                await Scheme.create(scheme);
                addedCount++;
            }
        }

        const allSchemes = await Scheme.find({ isActive: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: `Synced successfully. ${addedCount} new schemes found.`,
            data: allSchemes
        });

    } catch (error) {
        console.error('Error syncing schemes:', error);
        res.status(500).json({ message: 'Failed to sync with Government Portal' });
    }
};
