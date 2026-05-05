const mongoose = require('mongoose');

const MONGODB_URL = "mongodb+srv://aqibali:12312%21@cluster0.mjcb0uj.mongodb.net/Donation?appName=Cluster0";

mongoose.connect(MONGODB_URL).then(async () => {
    const contacts = await mongoose.connection.db.collection('contacts').find({}).toArray();
    console.log("Found contacts:", JSON.stringify(contacts, null, 2));
    process.exit(0);
}).catch(err => {
    console.error("DB Error:", err);
    process.exit(1);
});
