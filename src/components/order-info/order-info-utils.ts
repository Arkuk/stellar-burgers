import type { TIngredient, TOrder } from '@utils-types';

type TOrderComposition = {
  ingredients: TIngredient[];
  ingredientsWithCount: Record<string, TIngredient & { count: number }>;
  total: number;
};

export const getOrderComposition = (
  order: TOrder,
  ingredients: TIngredient[]
): TOrderComposition => {
  const ingredientsById = new Map(ingredients.map((item) => [item._id, item]));
  const orderIngredients: TIngredient[] = [];
  const ingredientsWithCount: TOrderComposition['ingredientsWithCount'] = {};
  let total = 0;

  for (const id of order.ingredients) {
    const ingredient = ingredientsById.get(id);
    if (!ingredient) continue;

    orderIngredients.push(ingredient);
    total += ingredient.price;
    const countedIngredient = ingredientsWithCount[id];
    if (countedIngredient) {
      countedIngredient.count += 1;
    } else {
      ingredientsWithCount[id] = { ...ingredient, count: 1 };
    }
  }

  return { ingredients: orderIngredients, ingredientsWithCount, total };
};
