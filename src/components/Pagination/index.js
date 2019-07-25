import React from 'react'

import PrimaryButton from '../PrimaryButton'

const Pagination = ({
    canPaginate,
    // clickHandlers
    nextPageHandler,
    prevPageHandler,
    // misc
    skipAmount,
}) =>
    // Single page with < 50 entries
    !canPaginate && skipAmount === 0
        ?
        null
        :
        // Prev/Next
        canPaginate && skipAmount > 0
            ?
            <div>
                <PrimaryButton text="Previous" onClickHandler={prevPageHandler} />
                <PrimaryButton text="Next" onClickHandler={nextPageHandler} />
            </div>
            :
            // Previous only
            !canPaginate && skipAmount > 0
                ?
                <div><PrimaryButton text="Previous" onClickHandler={prevPageHandler} /></div>
                :
                // Next only
                <div><PrimaryButton text="Next" onClickHandler={nextPageHandler} /></div>
                    
export default Pagination
