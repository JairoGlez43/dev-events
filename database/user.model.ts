import { mongoose } from '../lib/mongodb';
import bycrypt from 'bcryptjs';

// Tipos TS para un documento User
export interface UserAttrs {
  email: string;
  password: string; // hasheada
}

export interface UserDocument extends mongoose.Document, UserAttrs {
  createdAt: Date;
  updatedAt: Date;
  // métodos
  comparePassword(candidatePassword: string): boolean;
}

// Schema
const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // por defecto no incluir en queries
    },
  },
  { timestamps: true }
);

// Pre-save: hashear contraseña si cambió
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
    const hash = await bycrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

// Método: comparar contraseña
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const hash = await bycrypt.compare(candidatePassword, this.password);
  return hash;
};

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
