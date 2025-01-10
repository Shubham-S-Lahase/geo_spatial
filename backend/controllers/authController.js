const User = require('../models/User');
const { hashPassword, comparePasswords, generateToken } = require('../utils/auth');

// User Registration
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser  = await User.findOne({ email });
    if (existingUser ) {
      return res.status(400).json({ error: 'User  already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({ id: user._id, email: user.email, username: user.username });

    req.session.user = { id: user._id, email: user.email, username: user.username };

    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in user' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('token'); 
  res.status(200).json({ message: 'Logged out successfully' });
}