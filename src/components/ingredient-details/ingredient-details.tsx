import { Button } from '@krgaa/react-developer-burger-ui-components';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsLoading,
} from '@selectors';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { Preloader, IngredientDetailsUI } from '@ui';
import { Link, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from '@services/store';

export const IngredientDetails = (): React.JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectIngredientsLoading);
  const error = useSelector(selectIngredientsError);
  const ingredientData = ingredients.find((ingredient) => ingredient._id === id);

  if (!ingredientData) {
    if (isLoading) return <Preloader />;

    if (error) {
      return (
        <div>
          <p className="text text_type_main-default mb-6" role="alert">
            Не удалось загрузить ингредиент: {error}
          </p>
          <Button
            htmlType="button"
            onClick={() => {
              void dispatch(fetchIngredients());
            }}
          >
            Попробовать снова
          </Button>
        </div>
      );
    }

    return (
      <div className="text text_type_main-default">
        <p className="text mb-6">Ингредиент не найден.</p>
        <Link to="/">Вернуться к конструктору</Link>
      </div>
    );
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
