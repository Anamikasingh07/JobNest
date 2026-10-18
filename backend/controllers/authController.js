// Add to your existing controllers/authController.js or controllers/userController.js
const User = require('../models/User');

// Step 1: Recruiter Profile setup
exports.saveRecruiterProfile = async (req, res) => {
  try {
    const { jobTitle, companyName, website, industry, companySize, location, about, phone } = req.body;

    if (!jobTitle || !companyName || !industry || !companySize || !location || !about) {
      return res.status(400).json({ message: 'Please fill in all required profile fields.' });
    }

    const user = await User.findById(req.user.id);
    user.recruiterProfile = {
      jobTitle,
      companyName,
      website,
      industry,
      companySize,
      location,
      about,
      phone,
      isComplete: true
    };

    await user.save();
    res.json({ message: 'Recruiter profile saved successfully!', profile: user.recruiterProfile });
  } catch (error) {
    res.status(500).json({ message: 'Error saving recruiter profile.', error: error.message });
  }
};

// Step 9: Saved jobs / Wishlist toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { jobId } = req.params;

    const index = user.savedJobs.indexOf(jobId);
    if (index > -1) {
      user.savedJobs.splice(index, 1);
    } else {
      user.savedJobs.push(jobId);
    }

    await user.save();
    res.json({ savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ message: 'Error updating wishlist.', error: error.message });
  }
};