import Express, { Application } from "express";
import Cors from "cors";
import Dotenv from "dotenv";

Dotenv.config();

const PORT = process.env.PORT;
const app: Application = Express();

app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use("/", async (req, res) => {
  res.status(200).send({ message: "ok" });
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
