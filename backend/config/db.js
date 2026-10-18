const mongoose =
  require("mongoose");

const connectDB = async () => {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    // Remove the unique index left by the previous application schema, which
    // used `user` instead of `candidate` and blocked different candidates.
    const applicationCollection = mongoose.connection.collection('applications');
    const applicationIndexes = await applicationCollection.indexes().catch((error) => {
      if (error.codeName === 'NamespaceNotFound') return [];
      throw error;
    });
    if (applicationIndexes.some((index) => index.name === 'user_1_job_1')) {
      await applicationCollection.dropIndex('user_1_job_1');
      console.log('Removed obsolete application index user_1_job_1');
    }

    console.log(
      "MongoDB Connected"
    );

  }

  catch (error) {
    // Keep the connection string (which may contain credentials) out of logs.
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }

};

module.exports = connectDB;
