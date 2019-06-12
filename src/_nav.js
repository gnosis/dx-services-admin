const isPublicApp = process.env.REACT_APP_PUBLIC

const navArray = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
  },
  {
    title: true,
    name: isPublicApp ? 'VisualX' : 'Admin',
    wrapper: {
      element: '',
      attributes: {}
    },
    class: ''
  },
  {
    name: 'Markets',
    url: '/markets',
    icon: 'fa fa-line-chart',
  },
  {
    name: 'MGN Holders',
    url: '/mgn-holders',
    icon: 'cui-briefcase icons',
  },
  {
    name: 'Check balances',
    url: '/accounts',
    icon: 'fa fa-money',
  },
]

// Regular admin page
if (!isPublicApp) navArray.push(
  {
    name: 'Bots list',
    url: '/bots/list',
    icon: 'fa fa-heartbeat',
  },
  {
    name: 'Safes',
    url: '/safes',
    icon: 'fa fa-lock',
  },
  {
    title: true,
    name: 'About',
    wrapper: {
      element: '',
      attributes: {}
    },
    class: '',
  },
  {
    name: 'Bots',
    url: '/bots',
    icon: 'fa fa-info',
  }
)

export default {
  items: navArray,
};
