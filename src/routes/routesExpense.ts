import { Router, Request, Response } from "express";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  readExpense,
  totalByDateRage,
  totalExpenseByCategory,
  updateExpense,
} from "../controller/controller-expense.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  readExpense(res);
});

router.get("/:id", (req: Request, res: Response) => {
  getExpenseById(res, req);
});

router.post("/create", (req: Request, res: Response) => {
  createExpense(req, res);
});

router.put("/update/:id", (req: Request, res: Response) => {
  updateExpense(req, res);
});

router.delete("/delete/:id", (req: Request, res: Response) => {
  deleteExpense(req, res);
});

router.all("/total", (req: Request, res: Response) => {
  totalExpenseByCategory(req, res);
});

router.all("/totalBydate", (req: Request, res: Response) => {
  totalByDateRage(req, res);
});

export default router;
