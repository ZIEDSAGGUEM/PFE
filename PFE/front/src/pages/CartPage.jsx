import React from "react";
import { useSelector } from "react-redux";
import { Container, Row, Alert, Col, Table } from "react-bootstrap";
import "./CartPage.css";
import {
  useIncreaseCartProductMutation,
  useDecreaseCartProductMutation,
  useRemoveFromCartMutation,
} from "../services/appApi";
import CheckOutForm from "../components/CheckOutForm";
import ToastMessage from "../components/ToastMessage";

const CartPage = () => {
  const Delivery = 8;
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);

  const userObj = user.cart;
  let cart = products.filter((product) => userObj[product._id] != null);
  const [increaseCart, { isError }] = useIncreaseCartProductMutation();
  const [decreaseCart] = useDecreaseCartProductMutation();
  const [removeFromCart, { isLoading }] = useRemoveFromCartMutation();

  function handleDecrease(product) {
    const quantity = user.cart.count;
    if (quantity <= 0) return alert("Can't proceed");
    decreaseCart(product);
  }

  return (
    <Container className="product p-5">
      <Row className="mt-5 justify-content-center">
        <Col xs={12} md={6}>
          <h1 className="text-center mb-4">he Cart</h1>
          {cart.length === 0 ? (
            <Alert variant="info" className="text-center">
              Votre panier est vide. Ajoutez des produits !
            </Alert>
          ) : (
            <>
              <Table
                responsive="sm"
                variant="dark"
                className="cart-table text-center"
              >
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* loop through cart products */}
                  {cart.map((item, key) => (
                    <tr key={key}>
                      <td>
                        {!isLoading && (
                          <i
                            className="fa fa-times text-danger fs-5 me-3"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              removeFromCart({
                                productId: item._id,
                                price: item.price,
                                userId: user._id,
                              })
                            }
                          ></i>
                        )}
                      </td>
                      <td>
                        <img
                          src={item.pictures[0].url}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td>{item.price} TND</td>
                      <td>
                        <div className="d-flex justify-content-center align-items-center">
                          <i
                            className="fa fa-minus-circle text-danger fs-5 me-2"
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
                            className="fa fa-plus-circle text-success fs-5 ms-2"
                            onClick={() =>
                              increaseCart({
                                productId: item._id,
                                price: item.price,
                                countInStock: item.countInStock,
                                userId: user._id,
                              })
                            }
                          ></i>
                        </div>
                        {isError && (
                          <ToastMessage
                            bg="danger"
                            title="Échec d'ajout au panier"
                            body={`Rupture de stock`}
                          />
                        )}
                      </td>
                      <td>{item.price * user.cart[item._id]} TND</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="product text-center mt-5">
                <h3 className="h4 pb-2">
                  Total Produits: {user.cart.total} TND
                </h3>
                <h3 className="h4 pb-2">Frais de Livraison: {Delivery} TND</h3>
                <h3 className="h4 pb-2">
                  Total: {user.cart.total - Delivery} TND
                </h3>
              </div>
            </>
          )}
        </Col>
        {cart.length > 0 && ( // Only render checkout on items in cart
          <Col xs={12} md={6}>
            <CheckOutForm />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default CartPage;
