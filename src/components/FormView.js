import React, {Fragment} from "react";
import data from "../mock-data.json";
import FormInput from "./FormInput";
import "./FormView.css";

const FormView = () => {
	return (
		<form id="viewform">
			<h1>Your Form:</h1>
			{data.map((element) => (
				<Fragment>
					{<FormInput element={element}/>}
				</Fragment>
			))}
			<div>
				<input type="submit" value="Submit Form"/>
			</div>
		</form>
	);
}

export default FormView;
