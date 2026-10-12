import { AppHeader, IngredientDetails, Modal, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword,
} from '@pages';
import { fetchIngredients } from '@slices/ingredientsSlice';
import { checkUserAuth } from '@slices/userSlice';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useDispatch } from '@services/store';

import { ProtectedRoute } from '../protected-route/protected-route';

import type { Location } from 'react-router-dom';

import '../../index.css';

import styles from './app.module.css';

type ModalLocationState = { background?: Location };

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as ModalLocationState | null)?.background;

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  const closeModal = (): void => {
    void navigate(-1);
  };
  const ingredientPage = (
    <main className={styles.detailPageWrap}>
      <h1 className={clsx(styles.detailHeader, 'text text_type_main-large')}>
        Детали ингредиента
      </h1>
      <IngredientDetails />
    </main>
  );
  const orderPage = (
    <main className={styles.detailPageWrap}>
      <OrderInfo />
    </main>
  );
  const orderModal = (
    <Modal title={`#${location.pathname.split('/').at(-1) ?? ''}`} onClose={closeModal}>
      <OrderInfo />
    </Modal>
  );

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background ?? location}>
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/ingredients/:id" element={ingredientPage} />
        <Route path="/feed/:number" element={orderPage} />
        <Route element={<ProtectedRoute onlyUnAuth />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/orders" element={<ProfileOrders />} />
          <Route path="/profile/orders/:number" element={orderPage} />
        </Route>
        <Route path="*" element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детали ингредиента" onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route path="/feed/:number" element={orderModal} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile/orders/:number" element={orderModal} />
          </Route>
        </Routes>
      )}
    </div>
  );
};
export default App;
