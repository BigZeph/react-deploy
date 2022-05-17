import React, {useState} from 'react'
import axios from 'axios'
import './Contact.css'

const ContactSection = () => {
    const [contactData, setContactData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const handleContactFormChange = (event) => {
        event.preventDefault();
        var newContactData = {...contactData};
        newContactData[event.target.name] = event.target.value;
        setContactData(newContactData);

    }
    
    const handleContactFormSubmit = (event) => {
        event.preventDefault();
        const name = contactData.name, email = contactData.email, message = contactData.message;
        axios.put(`http://localhost:9000/contact?name=${name}&email=${email}&message=${message}`);
    }

    return (
        <>
        <div className="contact">
            <h1>Let us hear from YOU!</h1>
            <h2>Your information</h2>
            <form class="contactform" onSubmit={handleContactFormSubmit}>
                <input type="text" name="name" value={contactData.name} placeholder="Name"
                    onChange={handleContactFormChange} />
                <input type="text" name="email" value={contactData.email} placeholder="Email"
                    onChange={handleContactFormChange} />
                <textarea type="text" name="message" value={contactData.message} placeholder="Message"
                    onChange={handleContactFormChange} />
                <button type="submit">Submit</button>
            </form>
            <p>Whether it'd be questions on functionality, or general feedback, we are here for you.</p>
        </div>
        </>

    )
}

export default ContactSection;
