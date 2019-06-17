import React from 'react'
import { Input, InputGroupAddon, InputGroup } from 'reactstrap'

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
    optionValue = "",
    // Render prop
    render,
    // Ref, if necessary
    ref,
    // To require a submit button
    useSubmit,
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

export default PageFilter
