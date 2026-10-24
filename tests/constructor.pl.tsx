import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const harPath = fileURLToPath(new URL('./hars/constructor.har', import.meta.url));
const apiURL = 'https://norma.ffapi.ru/api';
const userName = 'Космический тестировщик';
const accessToken = 'Bearer test-access-token';
const refreshToken = 'test-refresh-token';
const bun = { id: 'bun-1', name: 'Космическая булка', price: 100 };
const filling = { id: 'main-1', name: 'Говяжья котлета', price: 50 };
const sauce = { id: 'sauce-1', name: 'Томатный соус', price: 25 };

const getIngredientCard = (page: Page, id: string): Locator =>
  page.getByRole('listitem').filter({
    has: page.locator(`a[href="/ingredients/${id}"]`),
  });

const getBurgerConstructor = (page: Page): Locator =>
  page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ', exact: true }),
  });

const addIngredient = async (page: Page, id: string): Promise<void> => {
  await getIngredientCard(page, id)
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};

const assembleBurger = async (page: Page): Promise<void> => {
  await addIngredient(page, bun.id);
  await addIngredient(page, filling.id);
  await addIngredient(page, sauce.id);
};

test.describe('Конструктор бургеров', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(harPath, {
      url: '**/api/**',
      notFound: 'abort',
      update: false,
    });
  });

  test.afterEach(async ({ page, context, baseURL }) => {
    if (baseURL && page.url().startsWith(baseURL)) {
      await page.evaluate(() => localStorage.clear());
    }
    await context.clearCookies();
  });

  test('добавляет булку, повторяющуюся начинку и соус, считает стоимость', async ({
    page,
  }) => {
    await page.goto('/');
    const burgerConstructor = getBurgerConstructor(page);

    for (const ingredient of [bun, filling, sauce]) {
      await expect(getIngredientCard(page, ingredient.id)).toBeVisible();
    }

    await expect(
      burgerConstructor.getByText('Выберите булки', { exact: true })
    ).toHaveCount(2);
    await expect(
      burgerConstructor.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();

    for (const name of [
      `${bun.name} (верх)`,
      `${bun.name} (низ)`,
      filling.name,
      sauce.name,
    ]) {
      await expect(burgerConstructor.getByText(name, { exact: true })).toHaveCount(0);
    }

    for (const ingredient of [bun, filling, sauce]) {
      await expect(
        getIngredientCard(page, ingredient.id).locator('.counter__num')
      ).toHaveCount(0);
    }

    await expect(
      burgerConstructor.getByRole('button', { name: 'Оформить заказ', exact: true })
    ).toBeDisabled();

    await assembleBurger(page);
    await addIngredient(page, filling.id);

    await expect(
      burgerConstructor.getByText(`${bun.name} (верх)`, { exact: true })
    ).toBeVisible();
    await expect(
      burgerConstructor.getByText(`${bun.name} (низ)`, { exact: true })
    ).toBeVisible();
    await expect(burgerConstructor.getByText(filling.name, { exact: true })).toHaveCount(
      2
    );
    await expect(burgerConstructor.getByText(sauce.name, { exact: true })).toBeVisible();
    await expect(
      getIngredientCard(page, bun.id).getByText('2', { exact: true })
    ).toBeVisible();
    await expect(
      getIngredientCard(page, filling.id).getByText('2', { exact: true })
    ).toBeVisible();
    await expect(
      getIngredientCard(page, sauce.id).getByText('1', { exact: true })
    ).toBeVisible();
    await expect(
      burgerConstructor.getByText(
        String(bun.price * 2 + filling.price * 2 + sauce.price),
        { exact: true }
      )
    ).toBeVisible();
  });

  test('открывает точные данные ингредиента и закрывает окно крестиком', async ({
    page,
  }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', {
      name: 'Детали ингредиента',
      includeHidden: true,
    });
    await expect(getIngredientCard(page, bun.id)).toBeVisible();
    await expect(dialog).toHaveCount(0);
    await getIngredientCard(page, bun.id).getByRole('link').click();

    await expect(page).toHaveURL(/\/ingredients\/bun-1$/);
    await expect(
      dialog.getByRole('heading', { name: bun.name, exact: true })
    ).toBeVisible();

    for (const [label, value] of [
      ['Калории, ккал', '262'],
      ['Белки, г', '8'],
      ['Жиры, г', '6'],
      ['Углеводы, г', '44'],
    ]) {
      await expect(
        dialog
          .getByRole('listitem')
          .filter({ hasText: label })
          .getByText(value, { exact: true })
      ).toBeVisible();
    }

    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер', exact: true })
    ).toBeVisible();
  });

  test('закрывает окно ингредиента кликом по оверлею', async ({ page }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog', {
      name: 'Детали ингредиента',
      includeHidden: true,
    });
    await expect(getIngredientCard(page, filling.id)).toBeVisible();
    await expect(dialog).toHaveCount(0);
    await getIngredientCard(page, filling.id).getByRole('link').click();

    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('heading', { name: filling.name, exact: true })
    ).toBeVisible();

    const overlay = page.locator('#modals > [role="dialog"] + div');
    await expect(overlay).toHaveCount(1);
    await overlay.click({ position: { x: 5, y: 5 } });

    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test('оформляет заказ авторизованного пользователя и очищает конструктор', async ({
    page,
    context,
    baseURL,
  }) => {
    if (!baseURL) throw new Error('Не настроен baseURL тестового приложения.');

    await context.addCookies([
      {
        name: 'accessToken',
        value: encodeURIComponent(accessToken),
        url: baseURL,
      },
    ]);
    await page.addInitScript((token) => {
      localStorage.setItem('refreshToken', token);
    }, refreshToken);

    await page.goto('/');
    await expect(
      page
        .getByRole('navigation', { name: 'Основная навигация' })
        .getByText(userName, { exact: true })
    ).toBeVisible();
    await assembleBurger(page);

    const dialog = page.getByRole('dialog', {
      name: 'Информация о заказе',
      includeHidden: true,
    });
    await expect(dialog).toHaveCount(0);

    const orderRequest = page.waitForRequest(
      (request) => request.url() === `${apiURL}/orders` && request.method() === 'POST'
    );
    const orderResponse = page.waitForResponse(
      (response) =>
        response.url() === `${apiURL}/orders` && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Оформить заказ', exact: true }).click();

    const request = await orderRequest;
    expect(request.postDataJSON()).toEqual({
      ingredients: [bun.id, filling.id, sauce.id, bun.id],
    });
    expect(request.headers().authorization).toBe(accessToken);
    expect((await orderResponse).status()).toBe(200);

    await expect(
      dialog.getByRole('heading', { name: '123456', exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByText('Ваш заказ начали готовить', { exact: true })
    ).toBeVisible();

    const burgerConstructor = getBurgerConstructor(page);
    await expect(
      burgerConstructor.getByText('Выберите булки', { exact: true })
    ).toHaveCount(2);
    await expect(
      burgerConstructor.getByText('Выберите начинку', { exact: true })
    ).toBeVisible();
    await expect(burgerConstructor.getByText('0', { exact: true })).toBeVisible();
    await expect(
      burgerConstructor.getByRole('button', { name: 'Оформить заказ', exact: true })
    ).toBeDisabled();

    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });
});
