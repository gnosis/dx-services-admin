import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const MarketList = React.lazy(() => import('./views/Markets/MarketList/MarketList'));
const BotsInfo = React.lazy(() => import('./views/Bots/BotsInfo/BotsInfo'));
const BotsList = React.lazy(() => import('./views/Bots/BotList/BotList'));
const CheckBalances = React.lazy(() => import('./views/Accounts/CheckBalances/CheckBalances'));
const AccountDetails = React.lazy(() => import('./views/Accounts/AccountDetails/AccountDetails'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/markets', exact: true, name: 'Markets', component: MarketList },
  { path: '/bots', exact: true, name: 'Bots', component: BotsInfo },
  { path: '/bots/list', name: 'List', component: BotsList },
  { path: '/accounts', exact: true, name: 'Accounts', component: CheckBalances },
  { path: '/accounts/:address', exact: true, name: 'Balances', component: AccountDetails }
];

export default routes;
