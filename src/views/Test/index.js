import React, { useEffect, useState } from 'react'
import { post } from 'axios'
import { from } from 'rxjs'

import { PageWrapper } from '../../containers'

import { queryLineMaker } from '../../utils'
import { GRAPH_URL } from '../../globals'

// const useViewData = (data) => {
//   const [state, setState] = useState({
//     data,
//   })

//   console.debug(state, setState)
//   return {
//     data
//   }
// }

const makeCustomQuery = ({
  rootQueries,
  rootArguments,
  whereQueries ,
  responseProperties,
  pagination: { paginationSize, paginationSkip },
}) =>
  `{ 
    ${rootQueries.map(root => (
      `${root}(
          first: ${paginationSize}
          skip: ${paginationSkip}
          ${rootArguments.map(argument => (
            `${argument.queryString}: ${argument.queryCondition}`
          )).join('\n\t\t\t')}
          where: {
            ${whereQueries.map(condition => (
              queryLineMaker(condition.queryCondition, condition.queryString)
            )).join('\n\t\t\t')}
          }
      ) {
        ${responseProperties.map(prop => prop.toString()).join('\n\t\t')}
      }`
    ))
    .join('\n\t')
    }
  }`

export const useGraphQuery = ({
  customQuery,
  rootQueries = [""],
  rootArguments = [],
  whereQueries = [],
  responseProperties = ["id"],
  paginationSize = 50,
  effectChangeConditions = []
}) => {
  const [graphData, setGraphData] = useState(undefined)
  const [paginationData, setPaginationData] = useState({
    canPaginate: false,
    paginationSize,
    paginationSkip: 0,
  })

  useEffect(() => {
    async function graphQLDataFetch() {
      const { paginationSize, paginationSkip } = paginationData

      const query = customQuery || makeCustomQuery({ rootQueries, rootArguments, whereQueries, responseProperties, pagination: { paginationSize, paginationSkip } })

      try {
        const { data: { data } } = await post(GRAPH_URL, { query })

        return data
      } catch (error) {
        const err = new Error(error.message)
        console.error(err)
        throw err
      }
    }

    const dataSubscription = from(graphQLDataFetch())
      .subscribe({
        next: (data) => {
          setGraphData(data)
          setPaginationData(state => ({
            ...state,
            canPaginate: data && data.length > 0,
          }))

          // sellTokenFilter && setURLFilterParams(`?sellToken=${sellTokenFilter}&buyToken=${buyTokenFilter}`)
        },
        error: error => {
          console.error(error)
          // setError(error)
          // setLoading(false)
        },
        complete: (res) => console.debug('DONE', res),
      })

    return () => {
      dataSubscription && dataSubscription.unsubscribe()
    }
  }, effectChangeConditions)

  return {
    graphData
  }
}

const Test = (props) => {
  // const { data } = useViewData(props.data)
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
      {JSON.stringify({ ...graphData }, null, 2)}
    </PageWrapper>
  )
}

export default Test
