import React, { useEffect, useRef } from "react";
import { Row, Col, Badge, Spinner } from "react-bootstrap";
import axios from "../axios";
import { useDispatch, useSelector } from "react-redux";
import { updateProducts } from "../features/productSlice";
import { MDBCarousel, MDBCarouselItem } from "mdb-react-ui-kit";
import G1 from "./imgs/E-4.png";
import G2 from "./imgs/X2.png";
import G3 from "./imgs/E-3.png";
import "./component.css";
import Loading from "./Loading";

export default function App() {
  const divRef = useRef(null);
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  const NewProducts = products.slice(0, 3);

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then(({ data }) => dispatch(updateProducts(data)));
  }, []);

  return (
    <div>
      <Row
        style={{
          backgroundColor: "#222",
          color: "#fff",
          padding: "50px 0",
          height: "700px",
        }}
        className="fw-normal text-center"
      >
        <h1 className="mt-5">Nouveautés</h1>
        <br />
        <MDBCarousel auto interval={9000} data-aos="zoom-in">
          {NewProducts.length < 1 ? (
            <Loading />
          ) : (
            NewProducts.map((product, key) => (
              <MDBCarouselItem
                key={key}
                itemId={product.id}
                interval={3000}
                ref={divRef}
                tabIndex="0"
                aria-label="Cliquez pour entendre le contenu"
              >
                <Row>
                  <Col md={6}>
                    {" "}
                    <img
                      src={product.pictures[0].url}
                      className="d-block mx-auto  w-50"
                      alt="..."
                    />
                  </Col>
                  <Col md={6} className=" my-auto">
                    <h2 className="w-50 mx-auto">{product.name}</h2>
                    <h2>Prix : {product.price} TND</h2>

                    <h2>
                      Caractéristique : <br />
                      {product.description}
                    </h2>
                    <Badge className=" p-4 fs-5 mx-2">
                      Catégorie :{product.category}
                    </Badge>
                    <Badge
                      className={`${
                        product.countInStock > 0
                          ? "bg-success p-4 fs-5"
                          : "bg-danger p-4 fs-5"
                      } `}
                    >
                      Disponibilité :
                      {product.countInStock > 0
                        ? "Disponible"
                        : "Non Disponible"}
                    </Badge>
                  </Col>
                </Row>
              </MDBCarouselItem>
            ))
          )}
        </MDBCarousel>
      </Row>
    </div>
  );
}
