const FormInput = ({element, value, handleEditChange}) => {
	const types = {
		text: ["textfield", "email", "html"],
		password: ["password"]
	};

	const parseType = (element_type) => {
		for(var type in types) if(element_type in types[type]) return type;
		return null;
	};

	return (
		<div>					
			{
				<input
					type={() => parseType(element.type)}
					name={element.key}
					placeholder={element.title}
					value={value}
					onChange={handleEditChange}
				/>
			}
		</div>
	);
};

export default FormInput;
