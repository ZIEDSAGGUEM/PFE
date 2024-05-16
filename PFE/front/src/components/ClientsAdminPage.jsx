import React, { useEffect, useState } from "react";
import { Table, Badge, Button, Modal, Form } from "react-bootstrap";
import axios from "../axios";
import Loading from "./Loading";
import { toast, ToastContainer } from "react-toastify";
function ClientsAdminPage() {
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [codeCoupon, setCodeCoupon] = useState("");
  const [expirationDateCoupon, setExpirationDateCoupon] = useState("");
  const [discountValueCoupon, setDiscountValueCoupon] = useState("");
  const [isActiveCoupon, setIsActiveCoupon] = useState("");

  const generateCouponCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const codeLength = 8; // Longueur du code du coupon
    let Code = "";

    // Générer le code aléatoire en sélectionnant des caractères aléatoires dans la chaîne de caractères
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      Code += characters[randomIndex];
    }

    setCodeCoupon(Code);
  };

  const handleClose = () => {
    setSelectedCoupon(null);
    setShow(false);
  };
  const handleShow = (coupon) => {
    setSelectedCoupon(coupon);
    setCodeCoupon(coupon.code);
    setExpirationDateCoupon(coupon.expirationDate);
    setDiscountValueCoupon(coupon.discountValue);
    setIsActiveCoupon(coupon.isActive);
    setShow(true);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8080/users")
      .then(({ data }) => {
        setLoading(false);
        setUsers(data);
      })
      .catch((e) => {
        setLoading(false);
        console.log(e);
      });
  }, []);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const response = await axios.get(
          "http://localhost:8080/users/allCoupons"
        );
        setCoupons(response.data);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    }

    fetchCoupons();
  }, [coupons]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/updateCoupon/${selectedCoupon._id}`,
        {
          code: codeCoupon,
          expirationDate: expirationDateCoupon,
          discountValue: discountValueCoupon,
          isActive: isActiveCoupon,
        }
      );
      // Gérer la réussite de la mise à jour du coupon ici
    } catch (error) {
      // Gérer l'erreur de mise à jour du coupon ici
      console.error("Erreur lors de la mise à jour du coupon :", error);
    }
  };
  const deleteCoupon = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8080/coupon/${id}`);
      toast.success("Coupon supprimé avec succès", response.data);
      // Faites quelque chose avec la réponse si nécessaire
    } catch (error) {
      toast.error("Erreur lors de la suppression du coupon :", error);
    }
  };

  if (loading) return <Loading />;
  if (users?.length == 0)
    return <h2 className="py-2 text-center">Non Utilisateurs</h2>;

  return (
    <div className=" d-flex flex-wrap">
      <iframe
        className=" rounded-5 mx-auto  mt-4 "
        style={{
          background: "#21313C",
          border: "none",
          borderRadius: "2px",
          boxShadow: "0 2px 10px 0 rgba(70, 76, 79, .2)",
          width: "250px",
          height: "250px",
        }}
        src="https://charts.mongodb.com/charts-ecommerce-bqopp/embed/charts?id=65d7420b-bc0a-4506-86bb-da80602896f0&maxDataAge=60&theme=dark&autoRefresh=true"
      ></iframe>

      <Table responsive bordered hover className="mt-5 table-dark">
        <thead>
          <tr>
            <th>Id Client </th>
            <th>Nom de Client</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Table
        responsive
        bordered
        hover
        className="mt-5 table-dark mx-auto text-center"
      >
        <thead>
          <tr>
            <th>Coupon Id</th>
            <th>Coupon Code</th>
            <th>Client</th>
            <th>Remise</th>
            <th>date d'éxpiration</th>
            <th>Etat</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr>
              <td>{coupon._id}</td>
              <td>
                <Badge bg="primary">{coupon.code}</Badge>
              </td>
              <td>
                <Badge bg="secondary">{coupon.userId.name}</Badge>
              </td>
              <td>
                <Badge bg="success">{coupon.discountValue} %</Badge>
              </td>
              <td>
                <Badge bg="warning">{coupon.expirationDate}</Badge>
              </td>
              <td>
                {coupon.isActive ? (
                  <Badge bg="primary">"Active"</Badge>
                ) : (
                  <Badge bg="danger">"Non Active"</Badge>
                )}
              </td>
              <td className=" d-flex">
                <Button
                  variant="danger"
                  className=" mx-2"
                  onClick={() => deleteCoupon(coupon._id)}
                >
                  Supprimer
                </Button>
                <Button variant="warning" onClick={() => handleShow(coupon)}>
                  Modifier
                </Button>
                <Modal show={show} onHide={handleClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Modifier Coupon</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className=" d-flex flex-column ">
                    <h3>id:{selectedCoupon ? selectedCoupon._id : ""}</h3>
                    Code :{" "}
                    <input
                      disabled
                      type="text"
                      value={codeCoupon}
                      onChange={(e) => setCodeCoupon(e.target.value)}
                      className=" bg-transparent text-black"
                      placeholder="nom de coupon"
                    />{" "}
                    <Button
                      className="my-3 w-25 mx-auto"
                      onClick={generateCouponCode}
                    >
                      {" "}
                      <i className="fas fa-repeat mx-2 "></i>
                      Générer
                    </Button>
                    Date d'éxpiration :{" "}
                    <input
                      type="text"
                      value={expirationDateCoupon}
                      onChange={(e) => setExpirationDateCoupon(e.target.value)}
                      className=" bg-transparent text-black"
                      placeholder="date d'expiration"
                    />
                    Remise :
                    <input
                      type="text"
                      maxLength={3}
                      value={discountValueCoupon}
                      onChange={(e) => setDiscountValueCoupon(e.target.value)}
                      className=" bg-transparent text-black"
                      placeholder="remise"
                    />
                    Status :
                    <Form.Select
                      name="isActive"
                      value={isActiveCoupon ? "true" : "false"}
                      onChange={(e) =>
                        setIsActiveCoupon(e.target.value === "true")
                      }
                      className="bg-transparent text-black"
                    >
                      <option value="true">Activé</option>
                      <option value="false">Non Activé</option>
                    </Form.Select>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Fermer
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                      Modifier
                    </Button>
                  </Modal.Footer>
                </Modal>
                <ToastContainer />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );

  return <div>ClientsAdminPage</div>;
}

export default ClientsAdminPage;
