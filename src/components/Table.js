import {useState, Fragment, useEffect} from 'react';
import './Table.css';
import data from "../mock-data.json";
import { nanoid } from 'nanoid';
import ReadOnlyRow from './ReadOnlyRow';
import EditableRow from './EditableRow';

const Table = () => {
    const [elements, setElements] = useState(data);
    const [save, setSave] = useState(elements);
    const [activeFormName, setActiveFormName] = useState(null);
    const [formNames, setFormNames] = useState([]);
    const [newFormName, setNewFormName] = useState("");
    const [creatingForm, setCreatingForm] = useState(false);

    const [addFormData, setAddFormData] = useState({
        title: "",
        key: '',
        type: ''
    });

    const [editFormData, setEditFormData] = useState({
        title: "",
        key: '',
        type: ''
    });

    const [editElementId, setEditElementId] = useState(null);

    const [clickElement, setClickElement] = useState(false);

    const handleClickElement = () => {
        setClickElement(!clickElement);
    }

    const handleAddPage = (event) => {
	    event.preventDefault();
        if(formNames.indexOf("new_table") === -1) {
            setFormNames([...formNames, "new_table"]);
            setActiveFormName("new_table");
            setCreatingForm(true);
        }
    }

    const handleDropPage = (event) => {
		event.preventDefault();
		fetch(`http://localhost:9000/update?oper=drop&formName=${activeFormName}`,
        { method: "DELETE" })
		.then(res => res.json().then(json_data => {
            if(json_data.success === 1) retrieveFormNames();
        }));
	}

    const handleCreateForm = (event) => {
        var url=`http://localhost:9000/update?oper=create&table_name=${newFormName}`;
        for(var i in elements) url += `&${elements[i].key}=${elements[i].title},${elements[i].type}`;
        fetch(url, { method: "PUT" });
        setCreatingForm(false);
    }
    const handleCancelCreateForm = (event) => {
        event.preventDefault();
        setCreatingForm(false);
        retrieveFormNames();
    }

    const handleChangeFormName = (event) => {
        event.preventDefault();
        setNewFormName(event.target.value);
    }
    const handleChangeFormNameSubmit = (event) => {
        event.preventDefault();
        fetch(`http://localhost:9000/update?oper=rename&formName=${activeFormName}&newFormName=${newFormName}`, {method: "PUT"})
        .then(() => {
            retrieveFormNames();
            setActiveFormName(newFormName);
        });
    }

    const handleAddFormChange = (event) => {
        event.preventDefault();

        const fieldName = event.target.getAttribute('name');
        const fieldValue = event.target.value;

        const newFormData = {...addFormData};
        newFormData[fieldName] = fieldValue;

        setAddFormData(newFormData);
    }

    const handleEditFormChange = (event) => {
        event.preventDefault();

        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        const newFormData = { ...editFormData };
        newFormData[fieldName] = fieldValue;

        setEditFormData(newFormData);
    }

    const handleAddFormSubmit = (event) => {
        event.preventDefault();

        const newElement = {
            id: nanoid(),
            title: addFormData.title,
            key: addFormData.key,
            type: addFormData.type
        }

        if(!creatingForm)
            fetch(`http://localhost:9000/update?oper=add&formName=${activeFormName}&key=${addFormData.key}&type=${addFormData.type}&title=${addFormData.title}`,
            { method: "PUT" });

        const newElements = [...elements, newElement];
        setElements(newElements);
    }

    const handleEditFormSubmit = (event) => {
        event.preventDefault();

        const index = elements.findIndex((element) => element.id === editElementId);

        const attrMap = {
            key: "new_key",
            type: "type",
            title: "title"
        };

        if(!creatingForm) {
            var url = `http://localhost:9000/update?oper=edit&key=${save[index].key}`;

            for(var attr in editFormData)
                if(editFormData[attr] !== save[index][attr])
                    url += `&${attrMap[attr]}=${editFormData[attr]}`;

            fetch(url, { method: "PUT" });
        }

        const editedElement = {
            id: editElementId,
            title: editFormData.title,
            key: editFormData.key,
            type: editFormData.type
        }

        const newElements = [...elements];

        newElements[index] = editedElement;

        setElements(newElements);
        setSave(newElements);
        setEditElementId(null);
    }

    const handleEditClick = (event, element) => {
        event.preventDefault();
        setEditElementId(element.id);

        const formValues = {
            title: element.title,
            key: element.key,
            type: element.type
        }

        setEditFormData(formValues);
    }

    const handleCancelClick = () => {
        setEditElementId(null);
    }

    const handleDeleteClick = (elementId) => {
        const newElements = [...elements];
        const index = elements.findIndex((element) => element.id === elementId);

	    fetch(`http://localhost:9000/update?oper=delete&key=${elements[index].key}`,
        { method: "DELETE" });

        newElements.splice(index, 1);

        setElements(newElements);
    }

    const retrieveFormNames = () => {
        fetch(`http://localhost:9000/retrieve?data=formNames`)
        .then(res => res.json().then(json_data => {
            var newFormNames = [];
            for(var formName in json_data) newFormNames.push(json_data[formName].Tables_in_purpledb);
            setFormNames(newFormNames);
        }));
    }

    const retrieveNameData = () => {
        if(!(activeFormName === undefined | activeFormName === null)) {
            fetch(`http://localhost:9000/retrieve?data=formData&formName=${activeFormName}`)
		    .then(res => res.json().then(json_data => {
                setElements(json_data);
                setSave(json_data);
            }));
        }
	}

    useEffect(() => {
        setNewFormName("");
        retrieveNameData();
    }, [activeFormName]);

    useEffect(() => {
        retrieveFormNames();
        setActiveFormName(formNames[0]);
    }, []);

    return (
        <div className="table-container">
            <button style={{width: 100, height: 50}} onClick={handleClickElement}>add element</button>
            <button style={{width: 100, height: 50}} onClick={handleAddPage}>add page</button>
            <button style={{width: 100, height: 50}} onClick={handleDropPage}>drop page</button>
            <button style={{width: 100, height: 50}}>add layout</button>
            <br />
            {formNames.map((formName) => {
                return (
                    <button class="purple_button" style={{width: 100, height: 50}}
                        id={formName === activeFormName ? "activeFormButton" : null }
                        onClick={() => {if(!creatingForm) setActiveFormName(formName)}}>
                        {formName}
                    </button>
                );
            })}
            <form onSubmit={handleChangeFormNameSubmit}>
                <input type="text" value={newFormName} onChange={handleChangeFormName}
                    placeholder={creatingForm ? "new table name" : null } />
                <input type="submit" hidden={creatingForm} value="Change Form Name" />
            </form><br />
            <form id="new_element" onSubmit={handleAddFormSubmit}>
                <input
                type={clickElement ? "text" : "hidden"}
                name="title"
                required="required"
                placeholder="Enter title..."
                onChange={handleAddFormChange}
                />
                <input
                type={clickElement ? "text" : "hidden"}
                name="key"
                required="required"
                placeholder="Enter key..."
                onChange={handleAddFormChange}
                />
                <label hidden={!clickElement && 'hidden'} for="type">type:</label>
                <select
                    hidden={!clickElement && 'hidden'}
                    id="type"
                    name="type"
                    onChange={handleAddFormChange}
                    required
                >
                    <option value="" disabled selected hidden>choose type</option>
                    <option value="HTML">HTML</option>
                    <option value="textfield">textfield</option>
                    <option value="email">email</option>
                </select>
                <button hidden={!clickElement && 'hidden'} type="submit">add</button>
                <button hidden={!clickElement && 'hidden'} onClick={handleClickElement} type="button">cancel</button>
            </form>
            <form onSubmit={handleEditFormSubmit}>
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Key</th>
                            <th>Type</th>
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {elements.map((element) => (
                            <Fragment>
                                    {editElementId === element.id ?
                                        <EditableRow
	                                        editFormData={editFormData}
	                                        handleEditFormChange={handleEditFormChange}
	                                        handleCancelClick={handleCancelClick}
                                        />
                                        :
                                        <ReadOnlyRow
	                                        element={element}
	                                        handleEditClick={handleEditClick}
	                                        handleDeleteClick={handleDeleteClick}
                                        />}
                            </Fragment>
                        ))}
                    </tbody>
	    	    </table>
            </form>
            <br />
            <button style={{width: 100, height: 50}} hidden={!creatingForm}
                onClick={handleCreateForm}>Finish</button>
            <button style={{width: 100, height: 50}} hidden={!creatingForm}
                onClick={handleCancelCreateForm}>Cancel
            </button>
	    </div>
    )
}

export default Table;
