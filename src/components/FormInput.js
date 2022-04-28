const FormInput = ({element}) => {
	const parseElement = (element) => {
		if(element.type === "textfield" || element.type === "email") return (
			<input id="text" type="text" placeholder={element.type}></input>
		);
		else if(element.type === "HTML") return (
			<i>(HTML Placeholder)</i>
		);
		else return (
			<i>(unidentified element)</i>
		);
	};

	return (
		<div>
			{parseElement(element)}
		</div>
	);
};

export default FormInput;
