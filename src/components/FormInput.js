const FormInput = ({element}) => {
	const parseElement = (element) => {
		if(element.type == "textfield") return (
			<input type="text" placeholder="text field"></input>
		);
		else if(element.type == "HTML") return (
			<i>(HTML placeholder)</i>
		);
		else if(element.type == "email") return (
			<input type="text" placeholder="e-mail address"/>
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
