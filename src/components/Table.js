import React, {useState, useEffect, Fragment} from 'react';
import axios from 'axios';
import './Table.css';
import data from "../mock-data.json";
import ReadOnlyRow from './ReadOnlyRow';
import EditableRow from './EditableRow';
import NewRow from './NewRow';

const Table = () => {
    const [elements, setElements] = useState(data);
    const [activeFormName, setActiveFormName] = useState(null);
    const [formNames, setFormNames] = useState([]);
    const [newFormName, setNewFormName] = useState("");
    const [creatingForm, setCreatingForm] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

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

    const reorderElements = () => {
        var keys = [];
        var url = `http://localhost:9000/fields?oper=reorder&form=${activeFormName}&keys=`;
        elements.forEach(element => keys.push(element.key));
        url = url + keys.join(",");
        axios.put(url).then(res => retrieveNameData());
    }

    const handleClickElement = () => {
        setClickElement(!clickElement);
    }

    const handleAddPage = () => {
        if(formNames.indexOf("new form") === -1) {
            setFormNames([...formNames, "new form"]);
            setActiveFormName("new form");
            setCreatingForm(true);
        }
    }

    const handleDropPage = () => {
		axios.delete(`http://localhost:9000/forms?form=${activeFormName}`)
		.then(res => {
            reorderElements();
            retrieveFormNames();
            setNewFormName("");
        });
	}

    const handleCreateForm = () => {
        var url=`http://localhost:9000/forms?oper=create&form=${newFormName}`;
        for(var i in elements)
            url += `&${elements[i].key}=${elements[i].title},${elements[i].type}`;
        axios.put(url)
        .then(res => {
            setUnsavedChanges(false);
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
        axios.put(`http://localhost:9000/forms?oper=rename&old_form=${activeFormName}&new_form=${newFormName}`)
        .then(res => {
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
            id: elements.length + 1,
            title: addFormData.title,
            key: addFormData.key,
            type: addFormData.type
        }

        if(!creatingForm) axios.put(`http://localhost:9000/fields?oper=add&form=${activeFormName}&key=${addFormData.key}&type=${addFormData.type}&title=${addFormData.title}`);

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
        const oldElement = elements[index];

        const attrMap = {
            key: "new_key",
            type: "type",
            title: "title"
        };

        if(!creatingForm) { 
            var url = `http://localhost:9000/fields?oper=edit&form=${activeFormName}&key=${oldElement.key}`;

            for(var attr in editFormData) if(editFormData[attr] !== oldElement[attr])
                url += `&${attrMap[attr]}=${editFormData[attr]}`;
            
            axios.put(url);
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
        setEditElementId(null);
    }

    const handleEditClick = (element) => {
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

	    axios.delete(`http://localhost:9000/fields?oper=delete&form=${activeFormName}&key=${elements[index].key}`);

        newElements.splice(index, 1);

        setElements(newElements);
    }

    const retrieveFormNames = () => {
        axios.get(`http://localhost:9000/forms`)
        .then(res => {
            var newFormNames = [];
            for(var formName in res.data) newFormNames.push(res.data[formName].Tables_in_purpledb);
            setFormNames(newFormNames);
        });
    }

    const retrieveNameData = () => {
        if(!(activeFormName === undefined | activeFormName === null)) {
            axios.get(`http://localhost:9000/fields?form=${activeFormName}`)
		    .then(res => setElements(res.data));
        }
	}
    
    const handleOrderChange = (event, element, increment) => {
        event.preventDefault();
        const old_index = elements.indexOf(element);
        const new_index = increment ? old_index + 1 : old_index - 1;
        if(0 <= new_index & new_index < elements.length) {
            var newElements = [...elements];
            const moving_element = newElements.splice(old_index, 1, elements[new_index])[0];
            newElements.splice(new_index, 1, moving_element);
            setElements(newElements);
            setUnsavedChanges(true);
        }
    }

    const handleOrderSubmit = () => {
        reorderElements();
        setUnsavedChanges(false);
    }
    const handleOrderCancel = () => {
        var newElements = [...elements];
        newElements.sort((a, b) => {
            if(a.id < b.id) return -1;
            else if(a.id > b.id) return 1;
            else return 0;
        });
        setElements(newElements);
        setUnsavedChanges(false);
    }

    useEffect(() => {
    }, [elements]);

    useEffect(() => {
        if(formNames.length > 0 & activeFormName == null) setActiveFormName(formNames[0]);
    }, [formNames]);

    useEffect(() => {
        setNewFormName(activeFormName);
        if(creatingForm) setElements([]);
        else retrieveNameData();
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
                        placeholder="form name" />
                    &nbsp;
                    <input type="submit" hidden={creatingForm} value="Change" />
                </div>
            </form>
            <br />
            <form style={{display: 'initial'}} onSubmit={handleEditFormSubmit}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
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
                                            handleOrderChange={handleOrderChange}
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
            <div id="table-footer">
                <button hidden={(!unsavedChanges)|creatingForm} onClick={handleOrderSubmit}>
                    Save
                </button>
                <button hidden={(!unsavedChanges)|creatingForm} onClick={handleOrderCancel}>
                    Cancel
                </button>
                <button hidden={!creatingForm} onClick={handleCreateForm}>
                    Finish
                </button>
                <button hidden={!creatingForm} onClick={handleCancelCreateForm}>
                    Cancel
                </button>
            </div>
	    </div>
    )
}

export default Table;
