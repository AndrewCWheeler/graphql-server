import mongoose from 'mongoose';

const ToDoSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
    },
    taskList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskList',
    },
  },
  { timestamps: true }
);

export const ToDo = mongoose.model('ToDo', ToDoSchema);
