import { useSelector } from "react-redux";
import { Container, Row, Alert, Col, Table } from "react-bootstrap";
import "./CartPage.css";
import axios from "../axios";
import { useRemoveFromCartMutation } from "../services/appApi";
import { useEffect, useState } from "react";
import io from "socket.io-client";
const FavoritePage = () => {
  const user = useSelector((state) => state.user);
  const [favorites, setFavorites] = useState([]);
  const [removeFromFavorites, { isLoading }] = useRemoveFromCartMutation();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/products/get-favorites/${user._id}`)
      .then(({ data }) => setFavorites(data))
      .catch((error) => console.error("Error fetching favorites:", error));
  }, []);

  const handleRemoveFavorite = async (userId, productId) => {
    try {
      // Make the API request to remove the favorite
      const response = await axios.post(
        "http://localhost:8080/products/remove-from-favorites",
        {
          userId,
          productId,
        }
      );
      if (response.status === 200) {
        // Optionally, trigger a callback or perform any other action on successful removal
        const x = favorites.filter((product) => product._id != productId);
        setFavorites(x);
      } else {
        // Handle unsuccessful response if needed
        console.error("Failed to remove favorite:", response.data);
      }
    } catch (error) {
      // Handle errors
      console.error("Error removing favorite:", error);
    }
  };

  console.log(favorites);

  return (
    <Container className="mt-5 product">
      <Row data-aos="fade">
        <Col>
          <h1 className="text-center">Ton Favoris</h1>
          {favorites.length === 0 ? (
            <Alert variant="info" className="text-center">
              Non de Favoris . Ajouter des Favoris
            </Alert>
          ) : (
            <Col md={12}>
              <Table
                responsive="sm"
                variant="dark"
                className="favorites-table text-center mx-auto"
              >
                <thead>
                  <tr>
                    <th scope="col">&nbsp;</th>
                    <th scope="col">Produit</th>
                    <th scope="col">Catégorie</th>
                    <th scope="col">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Loop through favorites */}
                  {favorites.map((item, key) => (
                    <tr key={key}>
                      <td>
                        {!isLoading && (
                          <i
                            className="fa fa-times cursor-pointer"
                            onClick={() =>
                              handleRemoveFavorite(user._id, item._id)
                            }
                          ></i>
                        )}
                        <img
                          src={item.picture[0].url}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                          }}
                          alt={item.name}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.price} TND</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FavoritePage;
