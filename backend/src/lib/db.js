import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://nataneldb:HMBHMlVrt6RAdUt1@cluster0.6fyrroy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}