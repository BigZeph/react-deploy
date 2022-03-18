import React, {useState, Fragment} from 'react';
import './Table.css';
import data from "../mock-data.json";
import { nanoid } from 'nanoid';
import ReadOnlyRow from './ReadOnlyRow';
import EditableRow from './EditableRow';

const Table = () => {

    const [elements, setElements] = useState(data);
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

        const newElements = [...elements, newElement];
        setElements(newElements);
    }

    const handleEditFormSubmit = (event) => {
        event.preventDefault();

        const editedElement = {
            id: editElementId,
            title: editFormData.title,
            key: editFormData.key,
            type: editFormData.type
        }

        const newElements = [...elements];

        const index = elements.findIndex((element) => element.id === editElementId);

        newElements[index] = editedElement;

        setElements(newElements);
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
    };

    const handleCancelClick = () => {
        setEditElementId(null);
    }

    const handleDeleteClick = (elementId) => {
        const newElements = [...elements];

        const index = elements.findIndex((element) => element.id === elementId);

        newElements.splice(index, 1);

        setElements(newElements);
    }

    return (
        <div className="table-container">  
            <button style={{width: 100, height: 50,}} onClick={handleClickElement}>add element</button>
            <button style={{width:100, height: 50}}>add page</button>
            <button style={{width: 100, height: 50}}>add layout</button>
            <form onSubmit={handleAddFormSubmit}>
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
        </div>
    )
}

export default Table;