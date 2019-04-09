import React from 'react'
import { Input, InputGroupAddon, InputGroup } from 'reactstrap'

const PageFilter = ({
    type,
    title = "Filter Name",
    filterWhat, 
    showWhat, 
    changeFunction, 
    inputName, 
    inputID, 
    optionValue = "",
    render,
}) => 
    <InputGroup>
        <InputGroupAddon addonType="prepend">{title}</InputGroupAddon>
        {
            type
                ?
                <Input
                type={type}
                value={showWhat}
                onChange={changeFunction}
                name={inputName}
                id={inputID || inputName}
            >
                {type === 'select' && <option value={optionValue}></option>}
                {type === 'select' && (render || filterWhat.map(objProp => (
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
            />
        }
    </InputGroup>

export default PageFilter
