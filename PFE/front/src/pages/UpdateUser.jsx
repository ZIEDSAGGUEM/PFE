import React, { useEffect, useState } from "react";
import { useUpdateUserMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import { Form, Button, Table, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deleteUser } from "../features/userSlice";

function UpdateUser() {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [lastThreeConfirmedOrders, setLastThreeConfirmedOrders] = useState([]);
  const [lastThreePendingOrders, setLastThreePendingOrders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDeleteAccount = async () => {
    try {
      // Display confirmation dialog
      const confirmDelete = window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ?"
      );

      if (confirmDelete) {
        setLoading(true);
        const response = await axios.delete(`users/user/${user._id}`);
        if (response.status === 200) {
          alert("Votre compte a été supprimé avec succès.");
          // Update Redux state to null
          dispatch(deleteUser());
          // Navigate to home page
          navigate("/");
        }
      } else {
        // User canceled deletion
        alert("Annulation de la suppression du compte.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserVideos = async () => {
      try {
        const response = await axios.get(`/videos/${user._id}/user`);
        setVideos(response.data.UserVideo);
      } catch (error) {
        console.error("Error fetching user's videos:", error);
      }
    };

    fetchUserVideos();
  }, [user._id]);

  useEffect(() => {
    const fetchUserCoupons = async () => {
      try {
        const response = await axios.get(`/coupon/${user._id}`);
        setCoupons(response.data.coupons);
      } catch (error) {
        console.error("Error fetching user coupons:", error);
      }
    };

    fetchUserCoupons();
  }, [user._id]);
  useEffect(() => {
    axios
      .get(`/users/${user._id}/orders`)
      .then(({ data }) => {
        // Filter orders by status
        const confirmedOrders = data.filter(
          (order) => order.status === "Commande Confirmé"
        );
        const pendingOrders = data.filter(
          (order) => order.status === "En Attende de Confirmation"
        );

        // Sort orders by date in descending order
        confirmedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        pendingOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get the last three orders for each status
        const lastThreeConfirmedOrders = confirmedOrders.slice(0, 3);
        const lastThreePendingOrders = pendingOrders.slice(0, 3);

        // Set the state with the filtered and sorted orders
        setLastThreeConfirmedOrders(lastThreeConfirmedOrders);
        setLastThreePendingOrders(lastThreePendingOrders);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [user._id]); // Assuming user._id is a dependency
  //console.log(orders);
  const userId = user._id;

  const [updateUser, { isLoading, isError, isSuccess }] =
    useUpdateUserMutation();

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      address,
      phone,
    };

    updateUser({ userId, userData })
      .then((res) => {
        // Handle success
        toast.success("Modification avec Succées:");

        setTimeout(() => {
          navigate("/");
        }, 3500);
      })
      .catch((error) => {
        // Handle error
        toast.error("Error updating user:");
      });
  };

  return (
    <div className=" w-75 container mx-auto" data-aos="fade-up">
      <Form
        onSubmit={handleSubmit}
        className=" position-relative container product w-75  mt-5 "
      >
        <img
          className=" mx-auto my-5 "
          style={{
            width: "125px",
            height: "125px",
            borderRadius: "50%",
            display: "block",
          }}
          src={user.picture}
        />

        <h5 className=" text-center">Informations Personnels</h5>
        <div className=" py-5 px-4 container">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Votre Nom</Form.Label>
            <Form.Control
              value={name}
              type="name"
              placeholder="Entrer Votre Nom"
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              value={email}
              type="email"
              placeholder="Entrer Votre Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Addresse</Form.Label>
            <Form.Control
              value={address}
              type="text"
              placeholder="Entrer Votre Addresse"
              onChange={(e) => setAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Téléphone</Form.Label>
            <Form.Control
              value={phone}
              type="text"
              placeholder="Entrer Votre Numéro de Téléphone"
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>
          <div>
            <Form.Group className=" mx-auto ">
              <Button type="submit" disabled={isLoading}>
                Modifier
                <i class="fa-solid fa-check mx-1"></i>
              </Button>
              <ToastContainer />
            </Form.Group>
            <Form.Group className=" mx-auto  position-absolute top-0 mt-5 ">
              <Button
                className=" bg-danger"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {loading ? "Suppression..." : "Supprimer"}
                <i class="fa-solid fa-user-xmark"></i>
              </Button>
              <ToastContainer />
            </Form.Group>
          </div>
        </div>
      </Form>
      <h5 className=" text-center">Vos Commandes</h5>
      <div
        style={{ height: "100px", width: "100px" }}
        className=" bg-black mx-auto text-center d-flex justify-content-center align-items-center rounded-4 mb-5 "
      >
        <h1 className=" text-warning ">{user.orders.length}</h1>
      </div>
      <div>
        <h1>3 Derniers Commandes Confirmés</h1>
        <Table striped bordered hover responsive className="text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paiement</th>
              <th>Status</th>
              <th>Prix</th>
            </tr>
          </thead>
          <tbody>
            {lastThreeConfirmedOrders.map((order, key) => (
              <tr>
                <td>{order._id}</td>
                <td>
                  <Badge>{order.paymentMethod}</Badge>
                </td>
                <td>
                  <Badge pill bg="success">
                    {order.status}
                  </Badge>
                </td>
                <td>{order.total}.000 TND</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div>
        <h1>3 Derniers Commandes Non Confirmées</h1>
        <Table striped bordered hover responsive className="text-center">
          <thead>
            <tr>
              <th>ID</th>
              <th>Paiement</th>
              <th>Status</th>
              <th>Prix</th>
            </tr>
          </thead>
          <tbody>
            {lastThreePendingOrders.map((order, key) => (
              <tr key={key}>
                <td>{order._id}</td>
                <td>
                  <Badge>{order.paymentMethod}</Badge>
                </td>
                <td>
                  <span className="badge bg-danger">{order.status}</span>
                </td>
                <td>{order.total}.000 TND</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div>
        <h1>Votre Rééls</h1>
        {videos.length > 0 ? (
          <div className=" d-flex flex-wrap justify-content-center ">
            {videos.map((video, index) => (
              <div
                className="  mx-1 text-center fs-5  position-relative"
                key={index}
              >
                <video width="425" height="500" className=" rounded-9" controls>
                  <source
                    src={`http://localhost:8080/${video.videoUrl}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
                <div
                  className="fs-2 position-absolute top-50 text-danger fw-bolder"
                  style={{ right: "10px" }}
                >
                  <i
                    className="fa-solid fa fa-heart  "
                    style={{ color: "red" }}
                  ></i>
                  <p>{video.likes}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun vidéo n’a été trouvée .</p>
        )}
      </div>
      <div>
        <h1>Votre Coupons</h1>
        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Pourcentage réduit</th>
              <th> Date d'éxpiration</th>
              <th>Activé</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, index) => (
              <tr key={index}>
                <td>
                  <Badge pill bg="success">
                    {coupon.code}
                  </Badge>
                </td>
                <td>
                  <Badge pill bg="primary">
                    {coupon.discountValue}
                  </Badge>
                </td>
                <td>
                  <Badge pill bg="secondary">
                    {coupon.expirationDate}
                  </Badge>
                </td>
                <td>
                  Activé:{" "}
                  <Badge pill bg="danger">
                    {coupon.isActive ? "Oui" : "Non"}
                  </Badge>
                </td>

                {/* Ajoutez d'autres colonnes de données du coupon ici si nécessaire */}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default UpdateUser;
