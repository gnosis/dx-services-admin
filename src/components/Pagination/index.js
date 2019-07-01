import React from 'react'

const Pagination = ({
    specificAuction,
    showPerPage,
    maxLimit,
    minLimit,
    nextPageHandler,
    previousPageHandler,
}) =>
    specificAuction || showPerPage > maxLimit ? null
        :
        (minLimit + showPerPage) >= maxLimit ? <div><button className="btn btn-primary" style={{ margin: 3 }} onClick={nextPageHandler}>Next</button></div>
            :
            ((minLimit - showPerPage) <= 0 && minLimit <= 0) ? <div><button className="btn btn-primary" style={{ margin: 3 }} onClick={previousPageHandler}>Previous</button></div>
                :
                <div>
                    <button className="btn btn-primary" style={{ margin: 3 }} onClick={previousPageHandler}>Previous</button>
                    <button className="btn btn-primary" style={{ margin: 3 }} onClick={nextPageHandler}>Next</button>
                </div>

export default Pagination
