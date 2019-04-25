const moment = require('moment')


module.exports = {
  // RDN
  '0x255aa6df07540cb5d3d297f0d0d4d84cb52bc8e6': {
    isValidTokenPair: true,
    state: 'RUNNING',
    isSellTokenApproved: true,
    isBuyTokenApproved: true,
    auctionIndex: 113,
    auctionStart: moment().add(-1, 'hours').toISOString(),
    auctionOpp: {
      sellVolume: '178813359155763398945',
      buyVolume: '0',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '3597645913701268092',
        denominator: '352400531418119196968'
      },
      price: {
        numerator: '2.609192698911844683723e+23',
        denominator: '2.01132603306891531669486e+25'
      },
      fundingInUSD: '2008.04994000000000001468',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '127.06964520367936925',
      boughtPercentage: '0',
      outstandingVolume: '2319656303882451320.05040991046754810713'
    },
    auction: {
      sellVolume: '0',
      buyVolume: '0',
      isClosed: true,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '352400531418119196968',
        denominator: '3597645913701268092'
      },
      price: {
        numerator: '2.55578485410990947601042e+25',
        denominator: '2.053356405244998763509e+23'
      },
      fundingInUSD: '2008.0499400000000016',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '127.06964520367936925',
      boughtPercentage: '0',
      outstandingVolume: '227217501056009470323.68745485700534561208'
    }
  },


  // KNC
  '0xdd974d5c2e2928dea5f71b9825b8b646686bd200': {
    isValidTokenPair: true,
    state: 'RUNNING',
    isSellTokenApproved: true,
    isBuyTokenApproved: true,
    auctionIndex: 217,
    auctionStart: moment().add(-4, 'hours').toISOString(),
    auction: {
      sellVolume: '1823672618181818183',
      buyVolume: '36121232133244323324',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '36767111845010829394',
        denominator: '3510724121065612435'
      },
      price: {
        numerator: '2.86562869720014404296836e+24',
        denominator: '1.813640080942495383921e+23'
      },
      fundingInUSD: '2006.0398800000000013',
      buyVolumesInSellTokens: '27219283262333324',
      priceRelationshipPercentage: '150.871080139372822299',
      boughtPercentage: '10',
      outstandingVolume: '28814805340231327803.03234320411690595234'
    },
    auctionOpp: {
      sellVolume: '19098958735903905483',
      buyVolume: '5543212312654673231',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '3510724121065612435',
        denominator: '36767111845010829394'
      },
      price: {
        numerator: '2.736258379958538331839e+23',
        denominator: '1.89938899791325944649404e+24'
      },
      fundingInUSD: '2006.03988000000000000677',
      buyVolumesInSellTokens: '275139457',
      priceRelationshipPercentage: '150.871080139372822299',
      boughtPercentage: '25',
      outstandingVolume: '2751394577256889452.02069723259765485377'
    }
  },


  // OMG
  '0xd26114cd6ee289accf82350c8d8487fedb8a0c07': {
    isValidTokenPair: true,
    state: 'WAITING_FOR_AUCTION_TO_START',
    isSellTokenApproved: true,
    isBuyTokenApproved: true,
    auctionIndex: 273,
    auctionStart: moment().add(4, 'minutes').toISOString(),
    auctionOpp: {
      sellVolume: '1.021274794025637098967e+21',
      buyVolume: '0',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '3563560670747237400',
        denominator: '1.993631771437303329856e+21'
      },
      price: {
        numerator: '3.0789164195256131136e+23',
        denominator: '8.61248925260915038497792e+25'
      },
      fundingInUSD: '2008.04994000000000000015',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '200',
      boughtPercentage: '0'
    },
    auction: {
      sellVolume: '1825499945454545456',
      buyVolume: '0',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '1.993631771437303329856e+21',
        denominator: '3563560670747237400'
      },
      price: {
        numerator: '1.722497850521830076995584e+26',
        denominator: '1.5394582097628065568e+23'
      },
      fundingInUSD: '2008.0499400000000016',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '200',
      boughtPercentage: '0'
    }
  },


  // MKR
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
    isValidTokenPair: true,
    state: 'ONE_AUCTION_HAS_CLOSED',
    isSellTokenApproved: true,
    isBuyTokenApproved: true,
    auctionIndex: 113,
    auctionStart: moment().add(-6, 'hours').toISOString(),
    auctionOpp: {
      sellVolume: '178813359155763398945',
      buyVolume: '2199077632684590224',
      isClosed: true,
      isTheoreticalClosed: true,
      closingPrice: {
        numerator: '3597645913701268092',
        denominator: '352400531418119196968'
      },
      price: {
        numerator: '2199077632684590224',
        denominator: '178813359155763398945'
      },
      fundingInUSD: '2008.04994000000000001468',
      buyVolumesInSellTokens: '178813359155763398945',
      priceRelationshipPercentage: '120.464404184741005314',
      boughtPercentage: '100',
      outstandingVolume: '0'
    },
    auction: {
      sellVolume: '1825499945454545456',
      buyVolume: '0',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '352400531418119196968',
        denominator: '3597645913701268092'
      },
      price: {
        numerator: '2.492881359251775199351632e+25',
        denominator: '2.1175743848045663989512e+23'
      },
      fundingInUSD: '2008.0499400000000016',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '120.183486238532110091',
      boughtPercentage: '0',
      outstandingVolume: '214904128893623901654.02053131457093165672'
    }
  },


  // GEN
  '0x543ff227f64aa17ea132bf9886cab5db55dcaddf': {
    isValidTokenPair: true,
    state: 'WAITING_FOR_FUNDING',
    isSellTokenApproved: true,
    isBuyTokenApproved: true,
    auctionIndex: 273,
    auctionStart: null,
    auctionOpp: {
      sellVolume: '1.021274794025637098967e+21',
      buyVolume: '0',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '3563560670747237400',
        denominator: '1.993631771437303329856e+21'
      },
      price: {
        numerator: '3.0789164195256131136e+23',
        denominator: '8.61248925260915038497792e+25'
      },
      fundingInUSD: '2008.04994000000000000015',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '200',
      boughtPercentage: '0'
    },
    auction: {
      sellVolume: '1825499945454545456',
      buyVolume: '0',
      isClosed: false,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '1.993631771437303329856e+21',
        denominator: '3563560670747237400'
      },
      price: {
        numerator: '1.722497850521830076995584e+26',
        denominator: '1.5394582097628065568e+23'
      },
      fundingInUSD: '2008.0499400000000016',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '200',
      boughtPercentage: '0'
    }
  },


  // DAI
  '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': {
    isValidTokenPair: true,
    state: 'PENDING_CLOSE_THEORETICAL',
    isSellTokenApproved: true,
    isBuyTokenApproved: true,
    auctionIndex: 273,
    auctionStart: moment().add(-20, 'hours').toISOString(),
    auctionOpp: {
      sellVolume: '1.021274794025637098967e+21',
      buyVolume: '0',
      isClosed: true,
      isTheoreticalClosed: true,
      closingPrice: {
        numerator: '3563560670747237400',
        denominator: '1.993631771437303329856e+21'
      },
      price: {
        numerator: '3.0789164195256131136e+23',
        denominator: '8.61248925260915038497792e+25'
      },
      fundingInUSD: '2008.04994000000000000015',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '200',
      boughtPercentage: '0'
    },
    auction: {
      sellVolume: '1825499945454545456',
      buyVolume: '0',
      isClosed: true,
      isTheoreticalClosed: false,
      closingPrice: {
        numerator: '1.993631771437303329856e+21',
        denominator: '3563560670747237400'
      },
      price: {
        numerator: '1.722497850521830076995584e+26',
        denominator: '1.5394582097628065568e+23'
      },
      fundingInUSD: '2008.0499400000000016',
      buyVolumesInSellTokens: '0',
      priceRelationshipPercentage: '200',
      boughtPercentage: '0'
    }
  }
}