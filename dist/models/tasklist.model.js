import mongoose from 'mongoose';
const TaskListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'This field is required'],
    },
    progress: {
        type: Number,
        required: true,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    todos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ToDo',
        },
    ],
}, { timestamps: true });
export const TaskList = mongoose.model('TaskList', TaskListSchema);
