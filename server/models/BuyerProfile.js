const mongoose = require('mongoose');

const BuyerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // A. Company Profile
    companyDetails: {
        companyName: { type: String, required: true },
        companyType: { type: String, enum: ['Food Processing', 'Exporter', 'Retail', 'Manufacturer', 'Other'] },
        gstNumber: String,
        cin: String,
        panNumber: String,
        logo: String
    },
    // B. Business Address
    address: {
        headOffice: String,
        state: String,
        district: String,
        pincode: String,
        gpsLocation: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: [Number]
        }
    },
    // C. Authorized Person
    authPerson: {
        name: String,
        designation: String,
        phone: String,
        email: String
    },
    // E. Metadata
    website: String,
    description: String,

    // F. Documents (Extended)
    documents: {
        gstCert: String,
        panCard: String,
        companyReg: String,
        fssaiLicense: String,
        contractTemplate: String,
        logo: String
    }
});

BuyerProfileSchema.index({ "address.gpsLocation": "2dsphere" });

module.exports = mongoose.model('BuyerProfile', BuyerProfileSchema);
