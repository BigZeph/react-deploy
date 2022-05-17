import React from "react";

const FormInput = ({element, value, handleEditChange}) => {
	const types = {
		textfield: "text",
		email: "email",
		password: "password",
		date: "date",
		number: "number",
		phone: "tel"
	};
	const placeholders = {
		phone: "123-456-7890"
	};

	return (
		<div>
			<span class="input_label">{element.title}: </span>
			{
				element.type === "textarea" ?
				<textarea type="text" name={element.key} value={value} onChange={handleEditChange} />
				:
				<input
					type={types[element.type]} name={element.key}
					pattern={element.type === "phone" ? "[0-9]{3}-[0-9]{3}-[0-9]{4}" : null}
					placeholder={placeholders[element.type]}
					value={value} onChange={handleEditChange}
				/>
			}
		</div>
	);
};

export default FormInput;
