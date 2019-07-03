import React, { useState } from 'react'
import { Badge, Input, InputGroupAddon, InputGroup } from 'reactstrap'

const PageFilter = ({
    type,
    title = "Filter Name",
    // If simple array to use and filter 1:1
    filterWhat, 
    // Input 'value' prop
    showWhat, 
    // CB to use on input/submit
    changeFunction, 
    inputName, 
    inputID, 
    // Render prop
    render,
    // Ref, if necessary
    ref,
}) => 
    <InputGroup>
        <InputGroupAddon addonType="prepend">{title}</InputGroupAddon>
        {
            type === 'select'
                ?
            <Input
                type={type}
                value={showWhat}
                onChange={changeFunction}
                name={inputName}
                id={inputID || inputName}
                innerRef={ref}
            >
                {/* <option value={optionValue}></option> */}
                {(render || filterWhat.map(objProp => (
                    <option key={objProp} value={objProp}>{objProp}</option>
                )))}
            </Input>
                :
            <Input
                type={type}
                value={showWhat}
                onChange={changeFunction}
                name={inputName}
                id={inputID || inputName}
                innerRef={ref}
            />
        }
    </InputGroup>

function PageFilterSubmit ({
    type,
    title = "Filter Name",
    buttonText = 'Submit',
    // CB to use on submit
    submitFunction, 
    inputName, 
    inputID, 
    ref,
}) {
    const [inputValue, setInputValue] = useState('')

    const handleChange = e => setInputValue(Math.round(e.target.value))

    return (
        <InputGroup>
            <InputGroupAddon addonType="prepend">{title}</InputGroupAddon>
                <Input
                    type={type}
                    value={inputValue}
                    onChange={handleChange}
                    name={inputName}
                    id={inputID || inputName}
                    innerRef={ref}
                />
                <button
                    className="btn btn-primary"
                    disabled={!inputValue}
                    onClick={(e) => { 
                        e.preventDefault()
                        submitFunction(inputValue)
                    }}
                >
                    {buttonText}
                </button>
        </InputGroup>    
)}

const FilterLabel = ({
    onClickHandler = () => null,
    badgeColour="success",
    customStyle,
    filterTitle='Filter Title',
    filterData,
  }) =>
    filterData
        ?
    <div onClick={onClickHandler} style={{ backgroundColor: '#d9ffd0', display: 'inline-block', padding: 10, margin: 2, cursor: 'pointer', ...customStyle }}>
      <strong>{filterTitle}:</strong>
      <Badge color={badgeColour} style={{ margin: '0 5px' }} pill>{filterData}</Badge> <strong style={{ cursor: 'pointer' }} onClick={onClickHandler}>x</strong>
    </div>
        :
    null

export {
    PageFilter as default,
    PageFilterSubmit,
    FilterLabel,
}
