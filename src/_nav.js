export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer'
      /*
      badge: {
        variant: 'info',
        text: 'NEW',
      },
      */
    },
    {
      title: true,
      name: 'Admin',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Markets',
      url: '/markets',
      icon: 'fa fa-line-chart',
    },
    {
      name: 'Trades',
      url: '/trades',
      icon: 'fa fa-exchange',
    },
    {
      name: 'MGN Holders',
      url: '/mgn-holders',
      icon: 'cui-briefcase icons',
    },
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
      name: 'Check balances',
      url: '/accounts',
      icon: 'fa fa-money',
    },
    {
      title: true,
      name: 'About',
      wrapper: {            // optional wrapper object
        element: '',        // required valid HTML5 element tag
        attributes: {}        // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
      },
      class: ''             // optional class names space delimited list for title item ex: "text-center"
    },
    {
      name: 'Bots',
      url: '/bots',
      icon: 'fa fa-info',
    }
  ],
};
