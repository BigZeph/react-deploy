import React from 'react'

const ReadOnlyRow = ({ element, handleEditClick, handleDeleteClick }) => {
  return (
    <tr>
        <td>{element.title}</td>
        <td>{element.key}</td>
        <td>{element.type}</td>
        <td>
            <button type="button" onClick={(event) => handleEditClick(event, element)}>edit</button>
            <button type="button" onClick={() =>  handleDeleteClick(element.id)}>delete</button>
        </td>
    </tr>
  )
}  

export default ReadOnlyRow