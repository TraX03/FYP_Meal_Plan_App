import { ListItem, ListType } from "@/app/lists/controller";

export function useSplitInventoryItems(items: ListItem[], activeTab: ListType) {
  const filteredItems = items.filter((item) => item.type === activeTab);
  const expiredItems: ListItem[] = [];

  const splitInventoryItems = filteredItems.flatMap((item) => {
    if (!Array.isArray(item.quantity)) return [item];

    const { quantity, expiries = [], checkedCount = 0 } = item;

    let toSplit = checkedCount;
    const checked: number[] = [],
      checkedExp: string[] = [];
    const unchecked: number[] = [],
      uncheckedExp: string[] = [];

    quantity.forEach((qty, i) => {
      const expiry = expiries[i];
      if (toSplit > 0) {
        if (qty > toSplit) {
          checked.push(toSplit);
          unchecked.push(qty - toSplit);
          if (expiry) {
            checkedExp.push(expiry);
            uncheckedExp.push(expiry);
          }
          toSplit = 0;
        } else {
          checked.push(qty);
          if (expiry) checkedExp.push(expiry);
          toSplit -= qty;
        }
      } else {
        unchecked.push(qty);
        if (expiry) uncheckedExp.push(expiry);
      }
    });

    const fresh: number[] = [],
      freshExp: string[] = [];
    const expired: number[] = [],
      expiredExp: string[] = [];

    unchecked.forEach((qty, i) => {
      const expiry = uncheckedExp[i];
      const isExpired =
        activeTab !== "shopping" && expiry && new Date(expiry) < new Date();
      if (isExpired) {
        expired.push(qty);
        if (expiry) expiredExp.push(expiry);
      } else {
        fresh.push(qty);
        if (expiry) freshExp.push(expiry);
      }
    });

    const createItem = (
      q: number[],
      e: string[],
      checked: boolean
    ): ListItem => ({
      ...item,
      quantity: q,
      expiries: e,
      quantityDisplay: q.reduce((sum, x) => sum + x, 0),
      checked,
    });

    if (expired.length)
      expiredItems.push(createItem(expired, expiredExp, false));

    return [
      ...(fresh.length ? [createItem(fresh, freshExp, false)] : []),
      ...(checked.length ? [createItem(checked, checkedExp, true)] : []),
    ];
  });

  const uncheckedItems = splitInventoryItems.filter((i) => !i.checked);
  const checkedItems = splitInventoryItems.filter((i) => i.checked);

  return {
    checkedItems,
    uncheckedItems,
    expiredItems,
  };
}
