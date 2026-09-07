import { describe, expect, it } from "vitest";
import { compileTemplate, computeNextDueDate, formatCurrency } from "./rentEngine";

describe("rentEngine helpers", () => {
  it("formats currency cleanly", () => {
    expect(formatCurrency("1450.50", "USD")).toBe("$1,450.50");
    expect(formatCurrency(2200, "USD")).toBe("$2,200.00");
  });

  it("substitutes placeholders correctly", () => {
    const template =
      "Hello {{tenant_name}}, your balance is {{balance}}. Due by {{due_date}}.";
    const rendered = compileTemplate(template, {
      tenant_name: "Sarah Connor",
      balance: "$850.00",
      due_date: "October 1, 2026",
    });
    expect(rendered).toBe(
      "Hello Sarah Connor, your balance is $850.00. Due by October 1, 2026."
    );
  });

  it("calculates next due date properly", () => {
    const midMonth = new Date(2026, 8, 15); // Sep 15, 2026
    const nextDue = computeNextDueDate(1, midMonth);
    expect(nextDue.getMonth()).toBe(9); // Oct (0-indexed 9)
    expect(nextDue.getDate()).toBe(1);

    const earlyMonth = new Date(2026, 8, 1); // Sep 1, 2026
    const dueEarly = computeNextDueDate(5, earlyMonth);
    expect(dueEarly.getMonth()).toBe(8); // Sep
    expect(dueEarly.getDate()).toBe(5);
  });
});
