const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    },
    vehicleDetails: {
        type: { type: String, enum: ['Car', 'Bike'] },
        name: String,
        regNumber: String
    },
    averageRating: { 
        type: Number,
        min: 0,
        max: 5
    },
    totalRatings: { 
        type: Number,
        default: 0
    },
    profilePictureUrl: { 
        type: String,
        default: 'https://api.pravatar.cc/150?u=a042581f4e29026704d' 
    },
    bio: { 
        type: String,
        maxlength: [250, 'Bio cannot be more than 250 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);