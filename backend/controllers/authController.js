const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Check if this is the first user (no users in database)
    const userCount = await User.countDocuments();
    let userRole = 'user';
    
    if (userCount === 0) {
      // First user is automatically an admin
      userRole = 'admin';
    } else if (role === 'admin') {
      // For subsequent requests, check if the current user is admin
      // We need to manually verify the token for registration route
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id).select('-password');
        
        if (!currentUser || currentUser.role !== 'admin') {
          return res.status(403).json({ message: 'Not authorized to create admin users' });
        }
        
        userRole = 'admin';
      } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: userCount > 0 ? generateToken(user._id) : undefined // Don't return token for admin-created users
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for user email
    const user = await User.findOne({ email });
    
    if (user && (await user.correctPassword(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };