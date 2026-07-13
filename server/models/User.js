import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    college: { type: String, trim: true, default: '' },
    branch: { type: String, trim: true, default: '' },
    semester: { type: Number, default: 1, min: 1 },
    targetSGPA: { type: Number, default: 8.5, min: 0, max: 10 },
    dailyStudyGoal: { type: Number, default: 4, min: 0 }, // hours per day
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
