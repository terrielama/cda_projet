import React, { useState } from "react";
import api from "../api";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const response = await api.post("contact/", formData);
      console.log("Message envoyé :", response.data);
      setSuccessMsg("Message envoyé avec succès !");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Erreur envoi message :", error);
      setErrorMsg("Erreur lors de l'envoi. Veuillez réessayer.");
    }
  };

  return (
    <div className="contact-form-container">
      <h2>Contactez-nous</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Votre nom"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Votre email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Sujet"
          value={formData.subject}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Votre message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Envoyer</button>
      </form>

      {successMsg && <p className="success">{successMsg}</p>}
      {errorMsg && <p className="error">{errorMsg}</p>}
    </div>
  );
};

export default Contact;
