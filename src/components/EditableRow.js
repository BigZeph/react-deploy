import React from 'react'

const EditableRow = ({ editFormData, handleEditFormChange, handleCancelClick }) => {
  return (
    <tr>
        <td>
            <input 
            text="text" 
            required="required" 
            placeholder="Enter title..." 
            name="title" 
            value={editFormData.title}
            onChange={handleEditFormChange}
            />
        </td>
        <td>
            <input 
            text="text" 
            required="required" 
            placeholder="Enter key..." 
            name="key" 
            value={editFormData.key}
            onChange={handleEditFormChange}
            /> 
        </td>
        <td>
            <select 
            id="type" 
            name="type" 
            onChange={handleEditFormChange}
            value={editFormData.type}
            required
            >
                <option value="HTML">HTML</option>
                <option value="textfield">textfield</option>
                <option value="email">email</option>
                <option value="password">password</option> 
                <option value="date">date</option>
                <option value="number">number</option>
                <option value="phone">phone</option>
            </select>
        </td>
        <td>
            <button type="submit">save</button>
            <button type="button" onClick={handleCancelClick}>cancel</button>
        </td>
    </tr>
  )
}

export default EditableRow