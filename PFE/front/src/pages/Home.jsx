import React, { useEffect, useRef, useState } from "react";
import axios from "../axios";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import { Row, Col, Container, Form } from "react-bootstrap";
import categories from "../Categories";
import Carousel from "../components/Carousel";
import "./Home.css";
import aos from "aos";
import "aos/dist/aos.css";
import { useDispatch, useSelector } from "react-redux";
import { updateProducts } from "../features/productSlice";
import ProductPreview from "../components/ProductPreview";
import Pagination from "../components/Pagination";

import Footer from "../components/Footer";

import { MDBListGroup, MDBListGroupItem, MDBCheckbox } from "mdb-react-ui-kit";
import Story from "../components/Story";
import Test from "../components/Test";

const Home = ({ on, handleClick }) => {
  const divRef = useRef(null);
  const user = useSelector((state) => state.user);
  const [order, setOrder] = useState("");

  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  const lastProducts = products.slice(2, 8);

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [productsInStock, setProductsInStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsInStock([]);
        const response = await axios.get("/products/filterStock", {
          params: { order }, // Pass the selected order as a query parameter
        }); // Assuming your API is running on the same origin

        setProductsInStock(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Handle error
        setLoading(false);
      }
    };

    fetchProducts();
  }, [order]);
  function ProductSearch({
    _id,
    category,
    name,
    pictures,
    price,
    countInStock,
  }) {
    return (
      <ProductPreview
        _id={_id}
        category={category}
        name={name}
        countInStock={countInStock}
        pictures={pictures}
        price={price}
      />
    );
  }

  const handleCheckboxChange = (price) => {
    // Set the selected price directly without toggling
    setSelectedPrice(price);

    // Fetch filtered products based on selected price
    axios
      .get(`http://localhost:8080/products/filter?maxPrice=${price}`)
      .then((response) => setFilteredProducts(response.data))
      .catch((error) =>
        console.error("Error fetching filtered products:", error)
      );
  };

  useEffect(() => {
    aos.init({ duration: 2500 });
  });

  return (
    <div className=" overflow-hidden">
      <div className="x ">
        <Carousel />
      </div>
      <div className=" ">
        <Test />
      </div>

      <div className="featured-products-container container mt-4    ">
        <h2>Derniers Produits</h2>
        {/* last products here */}
        <div
          className="d-flex justify-content-center flex-wrap bg-secondary bg-opacity-25 rounded-5 product"
          data-aos="fade-up"
        >
          {lastProducts.map((product, key) => (
            <ProductPreview
              on={on}
              handleClick={handleClick}
              key={key}
              {...product}
            />
          ))}
        </div>
        <div>
          <Link
            to="/category/all"
            style={{
              textAlign: "right",
              display: "block",
              textDecoration: "none",
            }}
            className=" text-danger fs-5"
          >
            Voir Plus {">>"}
          </Link>
        </div>
        <h1 className="mt-5">Filtrage</h1>
        <div className="container  ">
          <MDBListGroup className=" d-flex  flex-row flex-wrap justify-content-center product bg-dark bg-opacity-25 rounded-5 mb-5 ">
            {[300, 900, 1500, 3000, 5000, 7500, 9000, 12000, 15000].map(
              (price) => (
                <MDBListGroupItem
                  key={price}
                  className=" rounded-circle text-center text-white bg-transparent mx-2 my-2 "
                  style={{ border: "none" }}
                >
                  <MDBCheckbox
                    onChange={() => handleCheckboxChange(price)}
                    checked={selectedPrice === price}
                  />
                  {price}
                </MDBListGroupItem>
              )
            )}
          </MDBListGroup>
          <div className="d-flex justify-content-center flex-wrap  bg-secondary bg-opacity-25 rounded-5">
            {filteredProducts.length === 0 ? (
              <></>
            ) : (
              <Container>
                <Row className="mx-auto">
                  <Col lg={12}>
                    <Pagination
                      data={filteredProducts}
                      RenderComponent={ProductSearch}
                      pageLimit={1}
                      dataLimit={7}
                      tablePagination={false}
                    />
                  </Col>
                </Row>
              </Container>
            )}
          </div>
          <h1 className="mt-5">Produits Disponibles</h1>
          <label>
            <Form.Select
              name="order"
              className=" w-auto mb-3"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            >
              <option value="" disabled>
                -- Selectionner --
              </option>
              <option value="ascending">Min-Max</option>
              <option value="descending">Max-Min</option>
            </Form.Select>
          </label>

          <div className="d-flex justify-content-center flex-wrap  bg-secondary bg-opacity-25 rounded-5">
            {productsInStock.length === 0 ? (
              <h1>Pas de Produits</h1>
            ) : (
              <Container>
                <Row className="mx-auto">
                  <Col lg={12}>
                    <Pagination
                      data={productsInStock}
                      RenderComponent={ProductSearch}
                      pageLimit={1}
                      dataLimit={5}
                      tablePagination={false}
                    />
                  </Col>
                </Row>
              </Container>
            )}
          </div>
        </div>
      </div>
      {/* sale banner */}
      <div className="sale__banner--container mt-4">
        <img
          src="https://image.jeuxvideo.com/medias-md/170532/1705315355-5724-card.gif"
          style={{ width: "50%", height: "auto" }}
          data-aos="zoom-in-up"
        />
      </div>
      <div id="categorie" className="recent-products-container container mt-4">
        <h2>Categories</h2>
        <Row>
          {categories.map((category, key) => (
            <LinkContainer
              data-aos="slide-left"
              key={key}
              to={`/category/${category.name.toLocaleLowerCase()}`}
            >
              <Col md={4}>
                <div
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${category.img})`,
                    gap: "10px",
                  }}
                  className="category-tile"
                  onMouseEnter={(e) => handleClick(e, on)}
                  tabIndex="0"
                  aria-label="Cliquez pour entendre le contenu"
                >
                  {category.name}
                </div>
              </Col>
            </LinkContainer>
          ))}
        </Row>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
