  import { configureStore } from '@reduxjs/toolkit';

  import authReducer from './slices/authSlice';
  import moduleReducer from './slices/moduleSlice';
  import permissionReducer from './slices/permissionSlice';
  import dashboardReducer from './slices/dashboardSlice';
  import userReducer from './slices/userSlice';
  import sellerReducer from './slices/sellerSlice';
  import productReducer from './slices/productSlice';
  import orderReducer from "./slices/orderSlice"
  import paymentReducer from "./slices/paymentSlice"
  import categoryReducer from "./slices/categorySlice"
  import reviewReducer from './slices/reviewSlice';
  import reportReducer from './slices/reportSlice';
  import roleReducer from './slices/roleSlice';
  import notificationReducer from './slices/notificationSlice';
  import settingReducer from './slices/settingSlice';
  import profileReducer from './slices/profileSlice';
  import cartReducer from './slices/cartSlice';
  import wishlistReducer from './slices/wishlistSlice';

  const store = configureStore({
    reducer: {
      auth: authReducer,
      module: moduleReducer,
      permission: permissionReducer,
      dashboard: dashboardReducer,
      users: userReducer,
      sellers: sellerReducer,
      products: productReducer,
      order : orderReducer,
      payment : paymentReducer,
      category : categoryReducer,
      review : reviewReducer,
      report : reportReducer,
      role : roleReducer,
      notification : notificationReducer,
      setting : settingReducer,
      profile : profileReducer,
      cart : cartReducer,
      wishlist : wishlistReducer
    },
    devTools: process.env.NODE_ENV !== 'production',
  }); 

  export default store;