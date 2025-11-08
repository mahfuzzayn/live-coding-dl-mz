import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  category: string;
  amount: number;
  date: Date;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Food',
        'Transport',
        'Shopping',
        'Bills',
        'Entertainment',
        'Healthcare',
        'Education',
        'Travel',
        'Other',
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
ExpenseSchema.index({ userId: 1, date: -1 });

// Prevent re-compilation during development
const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;

