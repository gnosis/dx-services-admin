import React from 'react'
import { PageWrapper } from '../../containers'

import { useGraphQuery } from '../../hooks'

const Test = () => {
  const { graphData } = useGraphQuery({
    rootQueries: ["auctions"],
    whereQueries: [
      { queryString: "sellToken", queryCondition: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" }, 
      { queryString: "buyToken", queryCondition: "0x543ff227f64aa17ea132bf9886cab5db55dcaddf" }
    ],
    order: {
      orderBy: 'auctionIndex',
      orderDirection: 'desc',
    },
    responseProperties: ["id", "auctionIndex", "sellVolume", "buyVolume"],
    paginationSize: 50
  })

  return (
    <PageWrapper>
      {JSON.stringify({ ...graphData }, undefined, 2)}
    </PageWrapper>
  )
}

export default Test
