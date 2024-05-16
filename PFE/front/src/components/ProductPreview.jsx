import React, { useRef } from "react";
import { Card, CardImg, CardBody, CardTitle, Badge } from "react-bootstrap"; // Assuming Bootstrap is imported
import { Link } from "react-router-dom";

function ProductPreview({
  _id,
  category,
  name,
  price,
  countInStock,
  pictures,
  on,
  handleClick,
}) {
  const divRef = useRef(null);

  return (
    <Link to={`/product/${_id}`}>
      {" "}
      {/* Removed unnecessary Container */}
      <Card
        className="product-card shadow-sm"
        style={{ margin: "10px", cursor: "pointer" }}
      >
        {" "}
        {/* Added product-card class for styling */}
        <Card.Img
          variant="top"
          className="product-preview-img bg-light"
          src={pictures[0].url}
          style={{ height: "225px", objectFit: "cover" }}
        />
        <Card.Body className="d-flex flex-column justify-content-between  bg-dark bg-opacity-75 text-white">
          {" "}
          {/* Added d-flex and justify-content-between for vertical alignment */}
          <Card.Title>{name}</Card.Title>
          <div className="d-flex justify-content-between align-items-center mb-2">
            {" "}
            {/* Added d-flex for price and stock */}
            <Card.Text className=" w-100">{price},000 TND</Card.Text>
            {parseInt(countInStock) === 0 ? (
              <Badge className="mt-5" bg="warning" pill>
                Non Disponible
              </Badge>
            ) : (
              <Badge className="mt-5" bg="success" pill>
                En Stock
              </Badge>
            )}
          </div>
          <Badge bg="danger" className="float-end">
            {category}
          </Badge>{" "}
          {/* Added float-end for right alignment of category badge */}
        </Card.Body>
      </Card>
    </Link>
  );
}

export default ProductPreview;
