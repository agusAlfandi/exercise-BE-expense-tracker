import express from "express";
import GetDataExpense from "./routes/routesExpense.js";

const app = express();
const PORT = 3000;
app.use(express.json());

app.use("/expense", GetDataExpense);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
