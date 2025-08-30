const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function registerUser(event, data) {
  try {
    const { username, email, password } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // ✅ Convert to plain object and remove password
    const safeUser = user.toObject();
    delete safeUser.password;

    return { success: true, user: safeUser };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

async function loginUser(event, data) {
  try {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) return { success: false, message: "User not found" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { success: false, message: "Invalid password" };
    // ✅ Convert to plain object and remove password
    const safeUser = user.toObject();

    delete safeUser.password;

    return { success: true, user: safeUser };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

async function updateUser(event, data) {
  try {
    const { id, username, email, password } = data;

    const updateData = { username, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) return { success: false, message: "User not found" };

    // ✅ Convert to plain object and remove password
    const safeUser = user.toObject();
    delete safeUser.password;

    return { success: true, user: safeUser };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

async function deleteUser(event, id) {
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return { success: false, message: "User not found" };

    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
};
