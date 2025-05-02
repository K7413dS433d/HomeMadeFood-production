import mongoose from "mongoose";
const connected = async () => {
  await mongoose
    .connect(process.env.MONGODB)
    .then(() => {
      console.log("connected to database");
    })
    .catch((err) => {
      console.log("Error Connecting To Database ");
    });
};
export default connected;
