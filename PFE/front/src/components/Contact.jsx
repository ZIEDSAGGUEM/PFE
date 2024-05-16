import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Footer from "./Footer";
import emailjs from "@emailjs/browser";
import { useRef } from "react";

function TextControlsExample() {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_zvtbauw",
        "template_o407p3l",
        form.current,
        "PRapuqGCgue_6Rpm5"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };
  return (
    <div>
      <Form
        className="text-center fs-5 mx-auto mt-5 product p-5"
        style={{ width: "100%", maxWidth: "675px" }}
        data-aos="fade-down"
        ref={form}
        onSubmit={sendEmail}
      >
        <h1>Service Client</h1>
        <h2>Envoyer Un Message</h2>

        {/* Name Input */}
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Nom</Form.Label>
          <Form.Control
            type="text"
            className="bg-secondary text-white"
            placeholder="Nom"
            name="name"
          />
        </Form.Group>

        {/* Email Input */}
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            className="bg-secondary text-white"
            name="email"
          />
        </Form.Group>

        {/* Message TextArea */}
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            className="bg-secondary text-white"
            rows={3}
            name="message"
          />
        </Form.Group>

        {/* Submit Button */}
        <Form.Group>
          <Button type="submit" className="btn btn-dark">
            Envoyer
          </Button>
        </Form.Group>
      </Form>
      <Footer />
    </div>
  );
}

export default TextControlsExample;
