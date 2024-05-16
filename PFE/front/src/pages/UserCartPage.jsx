import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Container,
  Row,
  Alert,
  Col,
  Table,
  Form,
  Button,
} from "react-bootstrap";
import "./CartPage.css";
import {
  useIncreaseCartProductMutation,
  useDecreaseCartProductMutation,
  useRemoveFromCartMutation,
} from "../services/appApi";
import CheckOutForm from "../components/CheckOutForm";
import ToastMessage from "../components/ToastMessage";
import { Link, useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../services/appApi";
import axios from "../axios";
import "react-toastify/dist/ReactToastify.css";
const UserCartPage = () => {
  const Delivery = 8;
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);

  const userObj = user.cart;
  let cart = products.filter((product) => userObj[product._id] != null);

  const [increaseCart, { isError }] = useIncreaseCartProductMutation();
  const [decreaseCart] = useDecreaseCartProductMutation();
  const [removeFromCart, { isLoading }] = useRemoveFromCartMutation();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [selectedCoupon, setSelectedCoupon] = useState("");

  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);

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

  const [createOrder, { isLoading: load, isError: err, isSuccess }] =
    useCreateOrderMutation();
  const phone = user.phone;
  const address = user.address;
  const amount = user.cart.total;
  async function handlePlaceOrder(e) {
    e.preventDefault();

    try {
      if (paymentMethod === "BYCARD") {
        // Handle Online Payment

        await axios
          .post("http://localhost:8080/api/payment", { amount })
          .then((res) => {
            const { result } = res.data;

            window.location.href = result.link;
          });
        // Additional logic for online payment success
      } else if (paymentMethod === "COD") {
        // Handle Cash on Delivery
        await createOrder({
          userId: user._id,
          cart: user.cart,
          couponCode: selectedCoupon.code,
          address,
          phone,
        });
        if (!load && !err) {
          setTimeout(() => {
            navigate("/orders");
            toast.success("Commande Confirmé");
          }, 3000);
        }
      } else {
        // Handle other payment methods if needed
        console.log("Invalid payment method selected");
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleDecrease(product) {
    const quantity = user.cart.count;
    if (quantity <= 0) return alert("Can't proceed");
    decreaseCart(product);
  }
  return (
    <Container className="product p-5 mt-5">
      <h1 className="text-center">Votre Panier</h1>
      <Row className="mt-5 justify-content-center" data-aos="fade">
        {cart.length === 0 && (
          <Col xs={12}>
            <Alert variant="info" className="text-center">
              Votre Panier est Vide. Ajouter des Produits
            </Alert>
          </Col>
        )}

        {cart.length > 0 && (
          <>
            <Col md={6} className="mb-4">
              {/* Cart table */}
              <Table
                responsive="sm"
                variant="dark"
                className="cart-table text-center"
              >
                <thead>
                  <tr>
                    <th scope="col">&nbsp;</th>
                    <th scope="col">Produit</th>
                    <th scope="col">Prix</th>
                    <th scope="col">Quantité</th>
                    <th scope="col">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loop through cart products */}
                  {cart.map((item, key) => (
                    <tr key={key}>
                      <td>&nbsp;</td>
                      <td>
                        {!isLoading && (
                          <i
                            className="fa fa-times mr-2 cursor-pointer"
                            onClick={() =>
                              removeFromCart({
                                productId: item._id,
                                price: item.price,
                                userId: user._id,
                              })
                            }
                          ></i>
                        )}
                        <img
                          src={item.pictures[0].url}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                          }}
                          alt={item.name}
                        />
                      </td>
                      <td>{item.price} TND</td>
                      <td>
                        <div className="quantity-indicator d-flex justify-content-center align-items-center">
                          <i
                            className="fa fa-minus-circle mr-2"
                            onClick={() =>
                              handleDecrease({
                                productId: item._id,
                                price: item.price,
                                userId: user._id,
                              })
                            }
                          ></i>
                          <span>{user.cart[item._id]}</span>
                          <i
                            className="fa fa-plus-circle"
                            onClick={() =>
                              increaseCart({
                                productId: item._id,
                                price: item.price,
                                countInStock: item.countInStock,
                                userId: user._id,
                              })
                            }
                          ></i>
                          {isError && (
                            <ToastMessage
                              bg="danger"
                              title="Echec pour ajouter au carte"
                              body="Out Of Stock"
                            />
                          )}
                        </div>
                      </td>
                      <td>{item.price * user.cart[item._id]} TND</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Cart totals */}
              <div className="product text-center p-5">
                <h3 className="h4 pt-4">
                  Total Produit: {user.cart.total} TND
                </h3>
                {selectedCoupon && (
                  <h3 className="h4 pt-4">
                    Total Produit avec Réduction:{" "}
                    {user.cart.total * (1 - selectedCoupon.discountValue / 100)}{" "}
                    TND
                  </h3>
                )}
                {paymentMethod === "COD" && (
                  <>
                    <h3 className="h4 pt-4">
                      Frais de Livraison: {Delivery} TND
                    </h3>
                    <h3 className="h4 pt-4">
                      Total: {user.cart.total - Delivery} TND
                    </h3>
                  </>
                )}
              </div>
            </Col>
            <Col md={6}>
              <Form onSubmit={handlePlaceOrder}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Votre Nom"
                        value={user.name}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Votre Email"
                        value={user.email}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={7}>
                    <Form.Group className="mb-3">
                      <Form.Label>Addresse</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Addresse"
                        value={user.address}
                        disabled
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Téléphone</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Téléphone"
                        value={user.phone}
                        disabled
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Prix</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Prix"
                        value={amount}
                        name="amount"
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button className="w-25 h-25 mb-4 btn-secondary ">
                  <Link
                    to="/update"
                    className=" text-white mb-14 text-decoration-none fs-4 text-center"
                  >
                    <i className="fas fa-edit "></i>Modifier
                  </Link>
                </Button>
                <br></br>

                <label htmlFor="method_payment">Méthode de Paiement</label>

                <Form.Select
                  name="paymentMethod"
                  className=" w-50 mb-3"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="COD">Par Livraison</option>
                  <option value="BYCARD">En Ligne</option>
                </Form.Select>
                <label htmlFor="method_payment">Choisir ton Coupon</label>
                <Form.Select
                  className=" w-50"
                  value={selectedCoupon ? selectedCoupon._id : ""}
                  onChange={(e) => {
                    const selectedCouponId = e.target.value;
                    const selectedCoupon = coupons.find(
                      (coupon) => coupon._id === selectedCouponId
                    );
                    setSelectedCoupon(selectedCoupon);
                  }}
                >
                  <option value="" disabled>
                    Select a coupon
                  </option>
                  {coupons.map((coupon) => (
                    <option key={coupon._id} value={coupon._id}>
                      {coupon.code}
                    </option>
                  ))}
                </Form.Select>

                <Button className="mt-3 w-25 h-25 fs-4" type="submit">
                  <i className="fas fa-money-bill "></i> Payée
                </Button>
              </Form>
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
};

export default UserCartPage;
