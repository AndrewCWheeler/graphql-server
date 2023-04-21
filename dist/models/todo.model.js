import mongoose from 'mongoose';
const ToDoSchema = new mongoose.Schema({
    content: {
        type: String,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    taskList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaskList',
    },
}, { timestamps: true });
const ToDo = mongoose.model('ToDo', ToDoSchema);
export default ToDo;
