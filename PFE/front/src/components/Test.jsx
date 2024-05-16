import React, { useEffect, useState } from "react";
import { MDBCarousel, MDBCarouselItem } from "mdb-react-ui-kit";
import { Row, Col, Badge } from "react-bootstrap";
import { Modal, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import axios from "../axios";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Story from "./Story";
import "./Test.css";

const Test = () => {
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = (videoId) => {
    setShow(true);
    setSelectedVideo(videoId);
    setSelectedVideo(uploadedVideos.find((video) => video._id === videoId));
    // Set selected video ID
  };

  const user = useSelector((state) => state.user);

  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = async (videoId) => {
    try {
      const response = await axios.post(`/video/${videoId}/comment`, {
        text: commentText,
        userId: user._id,
      });
      console.log(response.data.message);
      // Optionally, you can update the UI to display the newly posted comment
      setCommentText(""); // Clear the comment input field after posting
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:8080/videos");
        setUploadedVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [uploadedVideos]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (selectedVideo && selectedVideo._id) {
          const response = await axios.get(
            `http://localhost:8080/videos/${selectedVideo._id}/comments`
          );
          setComments(response.data.comments);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchComments();
  }, [selectedVideo, comments]);

  const handleLike = async (videoId) => {
    const userId = user._id;

    if (likedVideos.includes(videoId)) {
      alert("You have already liked this video");
      return;
    }
    try {
      await axios.post(`http://localhost:8080/video/${videoId}`, { userId });

      setLikedVideos((prevLikedVideos) => [...prevLikedVideos, videoId]);
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };
  return (
    <div
      className=" pb-5"
      style={{ backgroundColor: "#3D3B40" }}
      data-aos="fade"
    >
      <Story />

      <h1 className="text-center text-white pt-5">Réels</h1>
      <Carousel showThumbs={false}>
        {uploadedVideos.map((video, index) => (
          <div
            className="flex mx-1 text-center fs-5 position-relative"
            key={index}
          >
            <div className="fs-2 d-flex   justify-content-around align-items-center  text-danger fw-bolder">
              <div>
                <img
                  src={video.createdBy.picture}
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  alt="User Avatar"
                />
                <div>
                  <h2>{video.createdBy.name}</h2>
                </div>
              </div>
              <div>
                <Button variant="primary" onClick={() => handleShow(video._id)}>
                  {user ? " Commenter" : "Voir"}
                </Button>

                <Modal
                  show={show}
                  onHide={handleClose}
                  backdrop="static"
                  keyboard={false}
                  style={{ overflow: "hidden" }}
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Commentaires</Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {selectedVideo &&
                      comments.map((comment) => (
                        <div className="comment-container" key={comment._id}>
                          <div className="commenter-info">
                            <img
                              className="commenter-avatar"
                              src={comment.commenter.avatar}
                              alt="Commenter Avatar"
                            />
                            <span className="commenter-name">
                              {comment.commenter.name}
                            </span>
                          </div>
                          <p className="comment-text">{comment.text}</p>
                          <p className="timestamp">
                            Posté dans:{" "}
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Fermer
                    </Button>
                    {user && (
                      <Button
                        variant="primary"
                        onClick={() => handleCommentSubmit(selectedVideo._id)}
                      >
                        Postuler
                      </Button>
                    )}
                  </Modal.Footer>
                  {user && (
                    <div className="textarea-container">
                      <textarea
                        disabled={!user}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Votre Commentaire"
                      />
                    </div>
                  )}
                </Modal>
              </div>
              <div>
                <i
                  onClick={() => handleLike(video._id)}
                  disabled={!user}
                  className="fa-solid fa fa-heart mx-3"
                  style={{ color: "red", cursor: "pointer" }}
                ></i>
                <p>{video.likes}</p>
              </div>
            </div>
            <video
              style={{ maxWidth: "100%", maxHeight: "650px" }}
              className="rounded-5"
              controls
            >
              <source
                src={`http://localhost:8080/${video.videoUrl}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Test;
