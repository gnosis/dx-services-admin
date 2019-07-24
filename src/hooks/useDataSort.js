import { useMemo, useState } from 'react'

function useDataSort(graphQLData) {
    const [dataSort, setDataSort] = useState({ key: 'timestamp', direction: 'dsc' })
    const [orderType, setOrderType] = useState('All')

    let sorted = useMemo(() => {
        const sortedData = graphQLData && graphQLData.slice().sort((a, b) => dataSort.direction === 'asc' ? a[dataSort.key] - b[dataSort.key] : b[dataSort.key] - a[dataSort.key])
        return sortedData
    }, [graphQLData, dataSort.key, dataSort.direction])

    sorted = useMemo(() => {
        if (orderType === 'All') return sorted
        return sorted.filter((trade) => {

            return trade.type === orderType
        })
    }, [sorted, orderType])

    return { sortedGQLData: sorted, dataSort, setDataSort, orderType, setOrderType }
}

export default useDataSort
