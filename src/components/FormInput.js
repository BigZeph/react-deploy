const FormInput = ({element, value, handleEditChange}) => {
	const types = {
		textfield: "text",
		email: "email",
		password: "password",
		date: "date",
		number: "number",
		phone: "tel"
	};

	return (
		<div>
			{<input
				type={types[element.type]} name={element.key}
				pattern={element.type === "phone" ? "[0-9]{3}-[0-9]{3}-[0-9]{4}" : null}
				placeholder={element.type === "phone" ? "(123-456-7890)": element.title}
				value={value} onChange={handleEditChange}
			/>}
		</div>
	);
};

export default FormInput;
