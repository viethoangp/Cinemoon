import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { ShowtimeScreen } from './components/screens/ShowtimeScreen';
import { SeatMapScreen } from './components/screens/SeatMapScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { AdminScreen } from './components/screens/AdminScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginScreen,
  },
  {
    // Pathless layout route — wraps all authenticated screens
    Component: AppLayout,
    children: [
      { path: '/home', Component: HomeScreen },
      { path: '/showtime', Component: ShowtimeScreen },
      { path: '/seat', Component: SeatMapScreen },
      { path: '/checkout', Component: CheckoutScreen },
      { path: '/profile', Component: ProfileScreen },
    ],
  },
  {
    path: '/admin',
    Component: AdminScreen,
  },
]);
