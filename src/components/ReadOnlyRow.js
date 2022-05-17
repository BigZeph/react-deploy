import React from 'react'

const ReadOnlyRow = ({ element, handleOrderChange, handleEditClick, handleDeleteClick }) => {
  return (
    <tr>
        <td class="order">
          <div>
            <button style={{width: '100%', 'font-size': '10pt'}} onClick={(event) => handleOrderChange(event, element, false)}>
              ▲
            </button>
            <div style={{width: '100%'}}>{element.id}</div>
            <button style={{width: '100%', 'font-size': '10pt'}} onClick={(event) => handleOrderChange(event, element, true)}>
             ▼
            </button>
          </div>
        </td>
        <td>{element.title}</td>
        <td>{element.key}</td>
        <td>{element.type}</td>
        <td>
            <div>
              <button type="button" onClick={() => handleEditClick(element)}>edit</button>
              <button type="button" onClick={() =>  handleDeleteClick(element.id)}>delete</button>
            </div>
        </td>
    </tr>
  )
}  

export default ReadOnlyRow