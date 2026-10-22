const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect MongoDB with explicit console confirmation
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Schemas & Models
const AdminSchema = new mongoose.Schema({ username: { type: String, unique: true }, passwordHash: String });
const Admin = mongoose.model('Admin', AdminSchema);

const DonationSchema = new mongoose.Schema({ 
    ref: String, 
    name: String, 
    amount: String, 
    status: { type: String, default: 'Pending Verification' },
    date: { type: Date, default: Date.now }
});
const Donation = mongoose.model('Donation', DonationSchema);

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify mail transporter on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Nodemailer Error: Check your EMAIL_USER and App Password in .env', error);
    } else {
        console.log('✅ Nodemailer is ready to send emails!');
    }
});

// Admin Signup Route
app.post('/api/admin/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newAdmin = new Admin({ username, passwordHash });
        await newAdmin.save();
        console.log(`👤 New Admin Registered: ${username}`);
        res.json({ success: true, message: 'Admin account created successfully' });
    } catch (err) {
        console.error('❌ Admin Signup Error:', err.message);
        res.status(400).json({ success: false, message: 'Username already exists or error occurred' });
    }
});

// Admin Login Route
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if(admin && await bcrypt.compare(password, admin.passwordHash)) {
            console.log(`🔑 Admin Logged In: ${username}`);
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('❌ Admin Login Error:', err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// Save a New Donation Route (Saves as Pending Verification by default)
app.post('/api/donations', async (req, res) => {
    try {
        const { ref, name, amount, status } = req.body;
        const newDonation = new Donation({ 
            ref, 
            name, 
            amount, 
            status: status || 'Pending Verification' 
        });
        await newDonation.save();
        console.log(`💰 New donation recorded: ${ref} - ${name} (${amount})`);
        res.json({ success: true, message: 'Donation saved successfully' });
    } catch (err) {
        console.error('❌ Error saving donation:', err);
        res.status(500).json({ success: false, message: 'Failed to save donation' });
    }
});

// Get Donations Ledger Route
app.get('/api/donations', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ date: -1 });
        res.json(donations);
    } catch (err) {
        console.error('❌ Error fetching donations:', err);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
});

// Admin Route to Verify/Approve a Donation
app.patch('/api/donations/:id/verify', async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id, 
            { status: 'Verified' }, 
            { new: true }
        );
        if (!donation) {
            return res.status(404).json({ success: false, message: 'Donation not found' });
        }
        console.log(`✅ Donation verified: ${donation.ref} - ${donation.name}`);
        res.json({ success: true, donation });
    } catch (err) {
        console.error('❌ Error verifying donation:', err);
        res.status(500).json({ success: false, message: 'Failed to verify donation' });
    }
});

// Volunteer Application Route (Sends Email to You)
app.post('/api/volunteer', async (req, res) => {
    try {
        const { name, email, skills } = req.body;
        console.log(`📩 Processing volunteer application from: ${name} (${email})`);
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'New Volunteer Application - Flourish Foundation',
            text: `You have a new volunteer application:\n\nName: ${name}\nEmail: ${email}\nSkills: ${skills}`
        });
        
        console.log('✅ Volunteer email sent successfully!');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

// Partner Inquiry Route (Sends Email to You)
app.post('/api/partner', async (req, res) => {
    try {
        const { org, email, interest } = req.body;
        console.log(`📩 Processing partner inquiry from: ${org} (${email})`);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'New Partner Inquiry - Flourish Foundation',
            text: `You have a new corporate partnership inquiry:\n\nOrganization: ${org}\nEmail: ${email}\nInterest: ${interest}`
        });

        console.log('✅ Partner inquiry email sent successfully!');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

app.listen(5000, () => console.log('🚀 Server running smoothly on port 5000'));