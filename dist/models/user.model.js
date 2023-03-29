import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [2, 'Name must be two or more characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: (val) => /^([\w-\.]+@([\w-]+\.)+[\w-]+)?$/.test(val),
            message: 'Please enter a valid email',
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    avatar: {
        type: String,
        default: null,
    },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);
export default User;
