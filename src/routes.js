import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const MarketList = React.lazy(() => import('./views/Markets/MarketList/MarketList'));
const BotsInfo = React.lazy(() => import('./views/Bots/BotsInfo/BotsInfo'));
const BotsList = React.lazy(() => import('./views/Bots/BotList/BotList'));
const CheckBalances = React.lazy(() => import('./views/Accounts/CheckBalances/CheckBalances'));
const MgnHolders = React.lazy(() => import('./views/MgnHolders'));
const AccountDetails = React.lazy(() => import('./views/Accounts/AccountDetails/AccountDetails'));
const Safes = React.lazy(() => import('./views/Safes'));
const PastAuctions = React.lazy(() => import('./views/PastAuctions'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/markets', exact: true, name: 'Markets', component: MarketList },
  { path: '/bots', exact: true, name: 'Bots', component: BotsInfo },
  { path: '/bots/list', name: 'List', component: BotsList },
  { path: '/accounts', exact: true, name: 'Accounts', component: CheckBalances },
  { path: '/mgn-holders', exact: true, name: 'MGN Holders', component: MgnHolders },
  { path: '/accounts/:address', exact: true, name: 'Balances', component: AccountDetails },
  { path: '/safes', exact: true, name: 'DutchX Safes', component: Safes },
  { path: '/past-auctions', exact: true, name: 'DutchX Past Auctions', component: PastAuctions },
];

export default routes;
