import Select from "react-select";

const MultiSelectDropdown = ({ options, value, label, selectedMembers, optionValue }) => {
    options = options.map(item => { return { value: item[value], label: item[label] } })

    const handleChange = (selected) => {
        selectedMembers(selected);
    };

    return (
        <div class="mt-3">
            <Select
                isMulti
                options={options}
                value={optionValue}
                onChange={handleChange}
                placeholder="Select Members For your Group..."
                isSearchable
            />
        </div>
    );
};

export default MultiSelectDropdown;
