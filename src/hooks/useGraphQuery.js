import { useCallback, useEffect, useState } from 'react'
import { post } from 'axios'
import { from } from 'rxjs'

import { queryLineMaker } from '../utils'
import { GRAPH_URL } from '../globals'

const makeCustomQuery = ({
  rootQueries,
  rootArguments,
  whereQueries,
  responseProperties,
  pagination: { paginationSize, paginationSkip },
}) =>
  `{ 
    ${rootQueries.map(root => (
    `${root}(
          first: ${paginationSize + 1}
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
  effectChangeConditions = [],
  // filterOption = { key: undefined, direction: undefined },
}) => {
  const [graphData, setGraphData] = useState(undefined)
  const [paginationData, setPaginationData] = useState({
    canPaginate: false,
    paginationSize,
    paginationSkip: 0,
  })
  const [error, setError] = useState(undefined)
  const { paginationSkip } = paginationData

  async function graphQLDataFetch() {
    const query = customQuery || makeCustomQuery({ rootQueries, rootArguments, whereQueries, responseProperties, pagination: { paginationSize, paginationSkip } })

    try {
      const { data: { data } } = await post(GRAPH_URL, { query })

      return data
    } catch (error) {
      const err = new Error(error)
      console.error(err)
      throw err
    }
  }

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // reset error state
    setError(undefined)
    setLoading(true)

    const dataSubscription = from(graphQLDataFetch())
      .subscribe({
        next: (data) => {
          setLoading(false)
          setGraphData(data)
          setPaginationData(state => ({
            ...state,
            canPaginate: data && data[`${rootQueries[0]}`].length > paginationSize,
          }))
        },
        error: error => {
          console.error(error)
          setError(error)
          setLoading(false)
        },
      })

    return () => {
      dataSubscription && dataSubscription.unsubscribe()
    }
  }, [paginationSkip, ...effectChangeConditions])

  return {
    graphData,
    loading,
    paginationData,
    error,
    nextPage: useCallback(() => setPaginationData(prevState => ({
      ...prevState,
      paginationSkip: prevState.paginationSkip + paginationData.paginationSize
    }))),
    prevPage: useCallback(() => setPaginationData(prevState => ({
      ...prevState,
      paginationSkip: prevState.paginationSkip - paginationData.paginationSize
    }))),
    resetPaginationSkip: useCallback(() => setPaginationData(prevState => ({
      ...prevState,
      paginationSkip: 0
    })))
  }
}
