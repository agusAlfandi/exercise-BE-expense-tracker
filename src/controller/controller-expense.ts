import { format, parseISO } from "date-fns";
import { Request, Response } from "express";
import fs, { writeFile } from "fs/promises";

const filePath = "./src/data/expense.json";

const getExpenses = async () => {
  try {
    const expenses = await fs.readFile(filePath, "utf-8");
    return JSON.parse(expenses);
  } catch (error) {
    console.error(error);
  }
};

export const readExpense = async (res: Response) => {
  try {
    const expenses = await getExpenses();
    res.status(200).json({ expenses });
  } catch (error) {
    console.log(error);
  }
};

export const getExpenseById = async (res: Response, req: Request) => {
  try {
    const expenses = await getExpenses();
    const expense = expenses.find(
      (item: { id: number }) => item.id === Number(req.params.id)
    );

    if (!expense) {
      res.status(404).json({ message: "Data expense not found" });
      return;
    }
    res.status(200).json({ expense });
  } catch (error) {
    console.error(error);
  }
};

export const createExpense = async (req: Request, res: Response) => {
  const { title, nominal, type, category } = req.body;
  try {
    if (!title || !nominal || !type || !category) {
      return res.status(400).json({ message: "Input data incomplete " });
    }
    const expenses = await getExpenses();

    // cari id terbesar untuk ditambahkan 1
    const maxId = expenses.reduce(
      (acc: number, expense: { id: number }) =>
        Math.max(acc, Number(expense.id)),
      0
    );
    const newExpense = {
      ...req.body,
      id: maxId + 1,
      // format tanggal ke yyyy-MM-dd menggunakan package date-fns
      date: format(parseISO(req.body.date), "yyyy-MM-dd"),
    };
    expenses.push(newExpense);

    await fs.writeFile(filePath, JSON.stringify(expenses, null, 2));
    res
      .status(201)
      .json({ message: "Success add new data", expense: newExpense });
  } catch (error) {
    console.error(error);
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  const { title, nominal, type, category, date } = req.body;

  if (!title || !nominal || !type || !category || !date) {
    return res.status(400).json({ message: "Input data incomplete" });
  }

  const expenses = await getExpenses();
  const expenseIndex = expenses.findIndex(
    (expenses: { id: number }) => expenses.id === Number(req.params.id)
  );

  const expense = expenses[expenseIndex];

  if (expenseIndex === -1) {
    res.status(404).json({ message: "Data expanse not found" });
  }

  expenses[expenseIndex] = {
    ...expense,
    ...req.body,
    // format tanggal ke yyyy-MM-dd menggunakan package date-fns
    date: format(parseISO(req.body.date), "yyyy-MM-dd"),
  };

  await fs.writeFile(filePath, JSON.stringify(expenses, null, 2));
  res.status(200).json({ message: "Data expanse updated", expense: expenses });
};

export const deleteExpense = async (req: Request, res: Response) => {
  const expense = await getExpenses();

  const newExpense = expense.filter(
    (item: { id: number }) => item.id !== Number(req.params.id)
  );

  if (newExpense.length === expense.length) {
    res.status(404).json({ message: "Data expanse not found" });
  }

  await writeFile(filePath, JSON.stringify(newExpense, null, 2));

  res.status(200).json({ message: "Data expanse deleted" });
};

export const totalExpenseByCategory = async (req: Request, res: Response) => {
  try {
    const expenses = await getExpenses();

    // category di filter berdasarkan inputan user
    const filteredItems = expenses.filter(
      (items: { category: string }) => items.category === req.body.category
    );

    // total nominal
    const total = filteredItems.reduce(
      (acc: number, curr: { nominal: number }) => acc + Number(curr.nominal),
      0
    );

    // Total income
    const totalIncome = expenses.reduce(
      (acc: number, curr: { nominal: number; type: string }) => {
        acc += curr.type === "income" ? Number(curr.nominal) : 0;
        return acc;
      },
      0
    );

    // Total expense
    const totalExpense = expenses.reduce(
      (acc: number, curr: { nominal: number; type: string }) => {
        acc += curr.type === "expense" ? Number(curr.nominal) : 0;
        return acc;
      },
      0
    );

    if (!total) {
      res.status(404).json({ message: "Total data expanse not found" });
      return;
    }
    const formateAllTotal = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(total);

    const formatTotalIncome = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(totalIncome);

    const formatTotalExpense = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(totalExpense);

    res.status(200).json({
      Total_ByCategory: formateAllTotal,
      Total_Income: formatTotalIncome,
      Total_Expense: formatTotalExpense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const totalByDateRage = async (req: Request, res: Response) => {
  try {
    const expenses = await getExpenses();

    // date di filter berdasarkan inputan user
    const filteredItems = expenses.filter(
      (items: { date: string }) =>
        items.date >= req.body.startDate && items.date <= req.body.endDate
    );

    // jika data ditemukan, maka akan dijumlahkan
    const total = filteredItems.reduce(
      (acc: number, curr: { nominal: number }) => acc + Number(curr.nominal),
      0
    );

    if (!total) {
      res.status(404).json({ message: "Total data expanse not found" });
      return;
    }

    const formatTotal = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(total);

    res.status(200).json({ total: formatTotal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
