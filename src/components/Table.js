import {useState, Fragment, useEffect} from 'react';
import './Table.css';
import data from "../mock-data.json";
import { nanoid } from 'nanoid';
import ReadOnlyRow from './ReadOnlyRow';
import EditableRow from './EditableRow';
import NewRow from './NewRow';

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
        if(formNames.indexOf("new form") === -1) {
            setFormNames([...formNames, "new form"]);
            setActiveFormName("new form");
            setCreatingForm(true);
        }
    }

    const handleDropPage = (event) => {
		event.preventDefault();
		fetch(`http://localhost:9000/update?oper=drop&formName=${activeFormName}`,
        { method: "DELETE" })
		.then(res => res.json().then(json_data => {
            if(json_data.success) {
                retrieveFormNames();
                setNewFormName("");
            }
        }));
	}

    const handleCreateForm = (event) => {
        var url=`http://localhost:9000/update?oper=create&table_name=${newFormName}`;
        for(var i in elements) url += `&${elements[i].key}=${elements[i].title},${elements[i].type}`;
        fetch(url, { method: "PUT" })
        .then(res => {
            retrieveFormNames();
            setCreatingForm(false);
            setActiveFormName(newFormName);
        });
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
        .then(res => res.json().then(json_data => {
            if(json_data.success) {
                retrieveFormNames();
                setActiveFormName(newFormName);
            }
        }));
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
        
        setAddFormData({
            title: "",
            key: "",
            type: ""
        });
        setClickElement(false);
        
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
            var url = `http://localhost:9000/update?oper=edit&formName=${activeFormName}&key=${save[index].key}`;

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

	    fetch(`http://localhost:9000/update?oper=delete&formName=${activeFormName}&key=${elements[index].key}`,
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
        if(formNames.length > 0 & activeFormName == null) setActiveFormName(formNames[0]);
    }, [formNames]);

    useEffect(() => {
        setNewFormName(activeFormName);
        if(creatingForm) {
            setElements([]);
            setSave([]);
        } else retrieveNameData();
    }, [activeFormName]);

    useEffect(() => {
        retrieveFormNames();
    }, []);

    return (
        <div className="table-container">
            <div>
                <button style={{width: 100, height: 50}} onClick={handleClickElement}>add element</button>
                <button style={{width: 100, height: 50}} onClick={handleAddPage}>add page</button>
                <button style={{width: 100, height: 50}} onClick={handleDropPage}>drop page</button>
                <button style={{width: 100, height: 50}}>add layout</button>
            </div>
            <br />
            <div>
            {formNames.map((formName) => {
                return (
                    <button class="purple_button" style={{width: 100, height: 50}}
                        id={formName === activeFormName ? "activeFormButton" : null }
                        onClick={() => {if(!creatingForm) setActiveFormName(formName)}}>
                        {(formName === activeFormName) & creatingForm ?
                            newFormName : formName
                        }
                    </button>
                );
            })}
            </div>
            <br />
            <form id="changeNameForm" onSubmit={handleChangeFormNameSubmit}>
                <div>
                    <input type="text" value={newFormName} onChange={handleChangeFormName}
                        placeholder="form name"/>
                    &nbsp;
                    <input type="submit" hidden={creatingForm} value="Change" />
                </div>
            </form>
            <br />
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
                        {
                            clickElement ?
                            <NewRow addFormData={addFormData}
                                handleClickElement={handleClickElement}
                                handleAddFormChange={handleAddFormChange}
                                handleAddFormSubmit={handleAddFormSubmit}
                            /> : null
                        }
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
