const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
// const ChatMessage = require('../model/ChatMessage');

const SALT_ROUNDS = 10;
const SECRET_KEY = 'aaaaaaaaaaaaabbbbbbbbbbbbbbbbbcccccccccccccccccccc';


//SignUp
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let isUserExist = false;
        try {
            const user = await User.findOne({ email });
            if (user) {
                isUserExist = true;
            }
        } catch (error) {
            console.log(error);
        }

        if (isUserExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        bcrypt.hash(password, SALT_ROUNDS, async (error, hash) => {
            if (error) {
                return res.status(400).json({ message: 'Error hashing password' });
            }

            const user = new User({
                name,
                email,
                password: hash,
                role,
                date: new Date()
            });

            await user.save();
            delete user.password;

            const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '7d' });

            return res.status(200).json({ user, token, status: 200});
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' , status: 500});
    }
};
//Login
exports.login = async (req, res) => {

    const{email,password}=req.body;

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'User not found',status:400});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid credentials',status:400});
        }

        user.password = undefined;
        const token = jwt.sign({email:user.email,role:user.role},SECRET_KEY,{expiresIn:'7d'});

        return res.status(200).json({user,token,status:200});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error',status:500});
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        // Clear the token from cookies
        res.clearCookie('token');

        return res.status(200).json({ message: 'Logged out successfully', status: 200 });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error', status: 500 });
    }
};

// // Get messages by room ID
// exports.getMessagesByRoomId = async (req, res) => {
//     const { roomId } = req.params;

//     try {
//         const messages = await ChatMessage.find({ roomId }).sort({ timestamp: 1 });

//         return res.status(200).send({ messages, status: 200 });
//     } catch (error) {
//         console.error('Error in getMessagesByRoomId:', error);
//         return res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// };
