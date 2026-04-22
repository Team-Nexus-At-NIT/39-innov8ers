const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const FarmerProfile = require('../models/FarmerProfile');
const BuyerProfile = require('../models/BuyerProfile');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    let { name, email, password, role, phone, location } = req.body;

    // Robust Fallbacks for Buyer
    if (role === 'buyer') {
        if (!name && req.body.companyName) name = req.body.companyName;
        if (!phone && req.body.authPhone) phone = req.body.authPhone;
        // Last resort fallback to satisfy validation if completely missing (should be caught by frontend validation though)
        // if (!phone) phone = "0000000000"; 
    }

    // Create user
    let user;
    try {
        user = await User.create({
            name,
            email,
            password,
            role,
            phone,
            location: {
                type: 'Point',
                coordinates: req.body.gpsCoordinates || [0, 0],
                address: location // assuming simple string for base address
            }
        });
    } catch (err) {
        console.error("User Creation Failed:", err.message);
        return next(err);
    }

    try {
        let profile = null;

        if (role === 'farmer') {
            profile = await FarmerProfile.create({
                user: user._id,
                personalDetails: {
                    fatherName: req.body.fatherName,
                    dob: req.body.dob,
                    gender: req.body.gender,
                    altPhone: req.body.altPhone,
                    languagePref: req.body.languagePref
                },
                kyc: {
                    aadhaarNumber: req.body.aadhaarNumber,
                    panNumber: req.body.panNumber,
                    kccNumber: req.body.kccNumber,
                    bankDetails: {
                        accountNumber: req.body.bankAccountNumber,
                        ifscCode: req.body.ifscCode,
                        bankName: req.body.bankName
                    }
                },
                location: {
                    state: req.body.state,
                    district: req.body.district,
                    taluka: req.body.taluka,
                    village: req.body.village,
                    pincode: req.body.pincode,
                    gpsCoordinates: {
                        type: 'Point',
                        coordinates: req.body.gpsCoordinates || [0, 0]
                    }
                },
                landDetails: {
                    totalLandArea: req.body.totalLandArea,
                    cultivableArea: req.body.cultivableArea,
                    irrigationSource: req.body.irrigationSource,
                    soilType: req.body.soilType,
                    waterAvailabilityScore: req.body.waterAvailabilityScore,
                    equipmentOwned: req.body.equipmentOwned
                },
                cropDetails: {
                    primaryCrops: req.body.primaryCrops,
                    seasonalCapacity: req.body.seasonalCapacity,
                    averagePastYield: req.body.averagePastYield,
                    experienceYears: req.body.experienceYears,
                    organic: req.body.organic === 'true' || req.body.organic === true,
                    fertilizersUsed: req.body.fertilizersUsed,
                    pestChallenges: req.body.pestChallenges
                },
                contractPreferences: {
                    willingness: req.body.willingness === 'true' || req.body.willingness === true,
                    preferredCrops: req.body.contractCrops,
                    minExpectedPrice: req.body.minExpectedPrice,
                    preferredDuration: req.body.preferredDuration,
                    paymentPreference: req.body.paymentPreference
                },
                communication: {
                    whatsappNumber: req.body.whatsappNumber,
                    smsAlerts: req.body.smsAlerts === 'true' || req.body.smsAlerts === true,
                    voiceAssistance: req.body.voiceAssistance === 'true' || req.body.voiceAssistance === true
                },
                documents: {
                    aadhaarFront: req.body.aadhaarFront,
                    aadhaarBack: req.body.aadhaarBack,
                    landRecord: req.body.landRecord // 7/12
                }
            });
        } else if (role === 'buyer') {
            // Validate Enum or Default
            const validTypes = ['Food Processing', 'Exporter', 'Retail', 'Manufacturer', 'Other'];
            const companyType = validTypes.includes(req.body.companyType) ? req.body.companyType : 'Other';

            profile = await BuyerProfile.create({
                user: user._id,
                companyDetails: {
                    companyName: req.body.companyName,
                    companyType: companyType,
                    gstNumber: req.body.gstNumber,
                    cin: req.body.cin,
                    panNumber: req.body.companyPanNumber,
                    companyLogo: req.body.companyLogo
                },
                address: {
                    headOffice: req.body.headOfficeAddress,
                    state: req.body.state,
                    district: req.body.district,
                    pincode: req.body.pincode,
                    gpsLocation: {
                        type: 'Point',
                        coordinates: req.body.gpsCoordinates || [0, 0]
                    }
                },
                authPerson: {
                    name: req.body.authPersonName,
                    designation: req.body.designation,
                    phone: req.body.authPhone,
                    email: req.body.authEmail
                }
            });
        }

        if (profile) {
            user.profileId = profile._id;
            user.roleProfileModel = role === 'farmer' ? 'FarmerProfile' : 'BuyerProfile';
            await user.save();
        }

        sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error("Profile Creation Failed:", err);
        // Rollback user creation if profile fails
        await User.findByIdAndDelete(user._id);

        // Return a cleaner error message
        res.status(500).json({
            success: false,
            error: err.message || 'Profile creation failed'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if user is verified (Admins bypass this)
    if (user.role !== 'admin' && !user.isVerified) {
        return res.status(403).json({
            success: false,
            error: 'Account verification pending. Please wait for Admin approval.'
        });
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res
        .status(statusCode)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
};

// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
exports.updateLocation = asyncHandler(async (req, res, next) => {
    const { coordinates } = req.body; // [lon, lat]

    if (!coordinates || coordinates.length !== 2) {
        return res.status(400).json({ success: false, error: 'Please provide valid coordinates [lon, lat]' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
        'location.type': 'Point',
        'location.coordinates': coordinates
    }, { new: true });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user location
// @route   PUT /api/auth/location
// @access  Private
exports.updateLocation = asyncHandler(async (req, res, next) => {
    const { coordinates } = req.body; // [lon, lat]

    if (!coordinates || coordinates.length !== 2) {
        return res.status(400).json({ success: false, error: 'Please provide valid coordinates [lon, lat]' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
        'location.type': 'Point',
        'location.coordinates': coordinates
    }, { new: true });

    res.status(200).json({
        success: true,
        data: user
    });
});
