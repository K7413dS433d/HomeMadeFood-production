import { globalError } from "./utils/index.utils.js";
import connected from "./DB/connection.js";
import routers from "./modules/index.routers.js";

const bootstrap = async (app, express) => {
  //unexpected errors handler
  process.on("uncaughtException", (err) => {
    console.log(err);
  });

  //API version
  const baseUrl = "/api/v1";

  //database connection
  await connected();

  //body parser
  app.use(express.json());

  //image path
  app.use("/uploads", express.static("uploads"));

  //authRouter
  app.use(`${baseUrl}/Auth`, routers.authRouter);

  //order Router
  app.use(`${baseUrl}/order`, routers.orderRouter);

  //review Router
  app.use(`${baseUrl}/review`, routers.reviewRouter);

  //cartItem Router
  app.use(`${baseUrl}/cart`, routers.cartItemRouter);

  //user router
  app.use(`${baseUrl}/users`, routers.userRouter);

  //location router
  app.use(`${baseUrl}/addresses`, routers.locationRouter);

  //meal router
  app.use(`${baseUrl}/meals`, routers.mealRouter);

  //not found handler
  app.all("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  //unexpected errors handler
  process.on("unhandledRejection", (err) => {
    console.log(err);
  });

  //global error handling
  app.use(globalError);
};

export default bootstrap;
