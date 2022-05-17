import React from "react";

const NewRow = ({addFormData, handleClickElement, handleAddFormChange, handleAddFormSubmit}) => {
    return(
        <tr>
            <td />
            <td>
                <div>
                    <input
                        type="text" name="title" required="required" placeholder="Enter title..."
                        value={addFormData.title} onChange={handleAddFormChange}
                    />
                </div>
            </td>
            <td>
                <div>
                    <input
                        type="text" name="key" required="required" placeholder="Enter key..."
                        value={addFormData.key} onChange={handleAddFormChange}
                    />
                </div>
            </td>
            <td>
                <div>
                    <select id="type" name="type" value={addFormData.type}
                        onChange={handleAddFormChange} required>
                            <option value="" disabled selected hidden>choose type</option>
                            <option value="HTML">HTML</option>
                            <option value="textfield">textfield</option>
                            <option value="textarea">textarea</option>
                            <option value="email">email</option>
                            <option value="password">password</option>
                            <option value="date">date</option>
                            <option value="number">number</option>
                            <option value="phone">phone</option>
                    </select>
                </div>
            </td>
            <td style={{display: 'flex'}}>
                <div>
                    <button onClick={handleAddFormSubmit}>add</button>
                    <button onClick={handleClickElement}>cancel</button>
                </div>
            </td>
        </tr>
    );
}

export default NewRow;