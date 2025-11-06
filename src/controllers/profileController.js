const db = require('../utils/db');

// GET - GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// UPDATE - PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      skills,
      availability,
      bio,
    } = req.body;

    // Build update data (exclude sensitive fields like email, password, role)
    const updateData = {};

    if (firstName !== undefined) {
      updateData.firstName = firstName;
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName;
    }
    if (phone !== undefined) {
      updateData.phone = phone === '' ? null : phone;
    }
    if (skills !== undefined) {
      updateData.skills = skills === '' ? null : skills;
    }
    if (availability !== undefined) {
      updateData.availability = availability === '' ? null : availability;
    }
    if (bio !== undefined) {
      updateData.bio = bio === '' ? null : bio;
    }

    // Update user
    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: userWithoutPassword,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};

// GET VOLUNTEERS - GET /api/volunteers (admin only)
exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await db.user.findMany({
      where: {
        role: 'VOLUNTEER',
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    // Remove passwords from response
    const volunteersWithoutPasswords = volunteers.map((volunteer) => {
      const { password, ...volunteerWithoutPassword } = volunteer;
      return volunteerWithoutPassword;
    });

    res.status(200).json(volunteersWithoutPasswords);
  } catch (error) {
    console.error('Get volunteers error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
};
