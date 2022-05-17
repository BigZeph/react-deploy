import React, {Fragment, useEffect, useState} from "react";
import axios from "axios";
import FormInput from "./FormInput";
import mockdata from "../mock-data.json";
import "./FormView.css";

const FormView = () => {
	const [data, setData] = useState(mockdata);
	const [activeForm, setActiveFormName] = useState(null);
	const [forms, setForms] = useState([]);
	const [formData, setFormData] = useState({});

	const retrieveForms = () => {
        axios.get(`http://localhost:9000/forms`)
        .then(res => {
            var newForms = [];
            for(var form in res.data) newForms.push(res.data[form].Tables_in_purpledb);
            setForms(newForms);
            setActiveFormName(newForms[0]);
        }).catch(error => console.log(error));
    }

	const retrieveData = () => {
		var newFormData = {};
		axios.get(`http://localhost:9000/fields?form=${activeForm}`)
		.then(res => {
			for(var index in res.data) newFormData[res.data[index].key] = "";
			setData(res.data);
			setFormData(newFormData);
		}).catch(err => console.log(err));
	}

	const handleEditChange = (event) => {
		event.preventDefault();
		var newFormData = { ...formData };
		newFormData[event.target.name] = event.target.value;
		setFormData(newFormData);
	}

	const uploadData = () => {
		var url = `http://localhost:9000/rows?form=${activeForm}`;
		for(var attr in formData) url += `&${attr}=${formData[attr]}`;
		axios.put(url);
	}

	useEffect(() => {
		if(activeForm != null)
			retrieveData();
	}, [activeForm]);
	
	useEffect(() => {
		retrieveForms();
	}, []);

	return (
		<div id="viewform-container">
			{forms.map((form) => {
                return (
                    <button class="purple_button" style={{width: 100, height: 50}}
						id={form === activeForm ? "activeFormButton" : null}
						onClick={() => setActiveFormName(form)}>
					{form}
                    </button>
                );
            })}
			<div id="form-header">
				<h1>{activeForm}</h1>
			</div>
			<div id="form-body">
				<form id="viewform" onSubmit={uploadData}>
					{data.map((element) => (
						<Fragment>
							{
								<FormInput
									element={element}
									value={formData[element.key]}
									handleEditChange={handleEditChange}
								/>
							}
						</Fragment>
					))}
					<input type="submit" value="Upload Data" onClick={uploadData} />
				</form>
			</div>
		</div>
	);
}

export default FormView;
