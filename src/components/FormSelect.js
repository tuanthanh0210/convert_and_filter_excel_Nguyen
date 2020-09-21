import React from 'react';
import Select from 'react-select';

const FormSelect = ({
    defaultValue= [],
    isMulti = false,
    placeholder = 'Select...',
    name,
    options={},
    onChange=() => {},
    closeMenuOnSelect = true,
    value=[]
}) => (
	<Select
		defaultValue={defaultValue}
        closeMenuOnSelect={closeMenuOnSelect}
        placeholder={placeholder}
		isMulti={isMulti}
        value={value}
		name={name}
		options={options}
		className="basic-multi-select"
		classNamePrefix="select"
        onChange={(value) => onChange(value)}
	/>
);

export default FormSelect;