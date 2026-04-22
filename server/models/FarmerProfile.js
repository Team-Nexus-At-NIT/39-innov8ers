const mongoose = require('mongoose');

const FarmerProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // A. Personal Details
    personalDetails: {
        fatherName: String,
        dob: Date,
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        altPhone: String,
        languagePref: { type: String, default: 'en' },
        profilePhoto: String
    },
    // B. KYC & Identity
    kyc: {
        aadhaarNumber: String, // Store masked or encrypted ideal
        panNumber: String,
        kccNumber: String,
        bankDetails: {
            accountNumber: String,
            ifscCode: String,
            bankName: String
        },
        verificationStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' }
    },
    // C. Location Details
    location: {
        state: String,
        district: String,
        taluka: String,
        village: String,
        pincode: String,
        gpsCoordinates: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: [Number] // [long, lat]
        }
    },
    // D. Land & Farming Details
    landDetails: {
        totalLandArea: Number, // in acres
        cultivableArea: Number,
        irrigationSource: { type: String, enum: ['Borewell', 'Canal', 'Rainfed', 'Drip', 'Sprinkler'] },
        soilType: { type: String, enum: ['Black', 'Red', 'Sandy', 'Clay', 'Loamy'] },
        waterAvailabilityScore: Number, // 1-10
        equipmentOwned: [String] // Tractor, Sprayer, etc.
    },
    // E. Crop Production
    cropDetails: {
        primaryCrops: [String],
        seasonalCapacity: Number, // MT
        averagePastYield: String, // e.g. "20 Quintals/Acre"
        experienceYears: Number,
        organic: Boolean,
        fertilizersUsed: [String],
        pestChallenges: [String]
    },
    // G. Contract Preferences
    contractPreferences: {
        willingness: { type: Boolean, default: true },
        preferredCrops: [String],
        minExpectedPrice: Number,
        preferredDuration: { type: String, enum: ['1 Month', '3 Months', '6 Months', '12 Months'] },
        paymentPreference: { type: String, enum: ['UPI', 'Bank Transfer', 'Cash'] }
    },
    // H. Communication
    communication: {
        whatsappNumber: String,
        smsAlerts: { type: Boolean, default: true },
        voiceAssistance: { type: Boolean, default: false }
    },
    // F. Uploads
    documents: {
        aadhaarFront: String,
        aadhaarBack: String,
        landRecord: String, // 7/12
        passbook: String,
        landPhoto: String,
        cropPhoto: String
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

FarmerProfileSchema.index({ "location.gpsCoordinates": "2dsphere" });

module.exports = mongoose.model('FarmerProfile', FarmerProfileSchema);
