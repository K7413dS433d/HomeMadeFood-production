import express from "express";
import cors from "cors";
import bootstrap from "./src/app.controller.js";

const app = express();
const port = +process.env.PORT || 3000;
app.get("/", (req, res) =>
  res.send(
    "this is for Last branch Toaa Commit Hash 8ca46e24c25b443d53ca4c288ecbbef9ab1008c2"
  )
);
app.use(cors());
bootstrap(app, express);
app.listen(port, (error) => {
  if (error) console.log(error);
  else console.log(`server running on port: ${port}`);
});
