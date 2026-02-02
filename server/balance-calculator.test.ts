import { describe, expect, it } from "vitest";
import { calculateDailyBalances, getCurrentBalance, getTodayBalance } from "../shared/balance-calculator";

describe("balance-calculator", () => {
  it("should calculate daily balances correctly", () => {
    // Use current date to ensure test works with Fortaleza timezone logic
    const now = new Date();
    const fortalezaNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
    const todayStr = `${fortalezaNow.getFullYear()}-${String(fortalezaNow.getMonth() + 1).padStart(2, '0')}-${String(fortalezaNow.getDate()).padStart(2, '0')}`;
    
    const activities = [
      {
        id: 1,
        childId: 1,
        name: "Test Positive",
        category: "positivos",
        points: 10,
        multiplier: 1,
        date: new Date(`${todayStr}T10:00:00-03:00`),
      },
      {
        id: 2,
        childId: 1,
        name: "Test Negative",
        category: "negativos",
        points: -5,
        multiplier: 1,
        date: new Date(`${todayStr}T11:00:00-03:00`),
      },
    ];

    const expenses = [
      {
        id: 1,
        childId: 1,
        description: "Test Expense",
        amount: 3,
        date: new Date(`${todayStr}T12:00:00-03:00`),
      },
    ];

    const balances = calculateDailyBalances(
      activities,
      expenses,
      100, // initial balance
      new Date(todayStr),
      1 // childId
    );

    expect(balances.length).toBeGreaterThan(0);
    
    // Get today's balance (last in array since we start from today)
    const today = balances[balances.length - 1];

    if (today) {
      expect(today.initialBalance).toBe(100);
      expect(today.positivePoints).toBe(10);
      expect(today.negativePoints).toBe(5); // absolute value
      expect(today.expenses).toBe(3);
      // finalBalance = 100 + 10 - 5 - 3 = 102
      expect(today.finalBalance).toBe(102);
    }
  });

  it("should filter activities by childId", () => {
    const activities = [
      {
        id: 1,
        childId: 1,
        name: "Child 1 Activity",
        category: "positivos",
        points: 10,
        multiplier: 1,
        date: new Date("2026-02-01"),
      },
      {
        id: 2,
        childId: 2,
        name: "Child 2 Activity",
        category: "positivos",
        points: 20,
        multiplier: 1,
        date: new Date("2026-02-01"),
      },
    ];

    const balances = calculateDailyBalances(
      activities,
      [],
      100,
      new Date("2026-02-01"),
      1 // only child 1
    );

    const today = balances[0];
    expect(today.positivePoints).toBe(10); // only child 1's activity
  });

  it("should get current balance correctly", () => {
    const balances = [
      {
        date: new Date("2026-02-01"),
        dateString: "01/02/2026",
        initialBalance: 100,
        positivePoints: 10,
        negativePoints: 5,
        expenses: 3,
        finalBalance: 102,
        activities: [],
        expensesList: [],
      },
      {
        date: new Date("2026-02-02"),
        dateString: "02/02/2026",
        initialBalance: 102,
        positivePoints: 20,
        negativePoints: 0,
        expenses: 0,
        finalBalance: 122,
        activities: [],
        expensesList: [],
      },
    ];

    const currentBalance = getCurrentBalance(balances);
    expect(currentBalance).toBe(122); // last day's final balance
  });

  it("should handle empty data", () => {
    const balances = calculateDailyBalances([], [], 0, null);
    expect(balances.length).toBeGreaterThan(0); // at least today
    expect(getCurrentBalance(balances)).toBe(0);
  });
});
