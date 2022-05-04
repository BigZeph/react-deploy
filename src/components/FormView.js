import {Fragment, useEffect, useState} from "react";
import FormInput from "./FormInput";
import mockdata from "../mock-data.json";
import "./FormView.css";

const FormView = () => {
	const [data, setData] = useState(mockdata);
	const [activeFormName, setActiveFormName] = useState(null);
	const [formNames, setFormNames] = useState([]);
	const [formData, setFormData] = useState({});

	const retrieveFormNames = () => {
        fetch(`http://localhost:9000/retrieve?data=formNames`)
        .then(res => res.json().then(json_data => {
            var newFormNames = [];
            for(var formName in json_data) newFormNames.push(json_data[formName].Tables_in_purpledb);
            setFormNames(newFormNames);
            setActiveFormName(newFormNames[0]);
        }))
        .catch(error => console.log(error));
    }

	const retrieveData = () => {
		var newFormData = {};
		console.log("activeFormName", activeFormName);
		fetch(`http://localhost:9000/retrieve?data=formData&formName=${activeFormName}`)
		.then(res => res.json().then(json_data => {
			for(var index in json_data) newFormData[json_data[index].key] = "";
			setData(json_data);
			setFormData(newFormData);
		}))
		.catch(err => console.log(err));
	}

	const handleEditChange = (event) => {
		event.preventDefault();
		var newFormData = { ...formData };
		newFormData[event.target.name] = event.target.value;
		setFormData(newFormData);
	}

	const uploadData = (event) => {
		event.preventDefault();
		var url = `http://localhost:9000/upload?formName=${activeFormName}`;
		for(var attr in formData) url += `&${attr}=${formData[attr]}`;
		fetch(url, { method: "PUT" })
		.then(res => res.text().then(text => {console.log(text)}));
	}

	useEffect(() => {
		console.log(formData);
	}, [formData]);

	useEffect(() => {
		if(activeFormName != null) retrieveData();
	}, [activeFormName]);
	
	useEffect(() => {
		retrieveFormNames();
	}, []);

	return (
		<div>
			{formNames.map((formName) => {
                return (
                    <button class="purple_button" style={{width: 100, height: 50}}
                        id={formName === activeFormName ? "activeFormButton" : null}
                        onClick={() => setActiveFormName(formName)}
					>
                        {formName}
                    </button>
                );
            })}
			<form id="viewform" onSubmit={uploadData}>
				<div class="form-header">
					<h1>Your Form:</h1>
				</div>
				<div class="form-body">
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
				</div>
				<div class="form-footer">
					<input type="submit" value="Upload Data" onClick={uploadData} />
				</div>
			</form>
		</div>
	);
}

export default FormView;
