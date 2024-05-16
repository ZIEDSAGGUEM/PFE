import React, { useState, useEffect } from "react";
import axios from "../axios";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form } from "react-bootstrap";

function Story() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [orders, setOrders] = useState([]);
  const [ord, setOrd] = useState("");
  const [verify, setVerify] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const user = useSelector((state) => state.user);

  //console.log(orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/users/orders/${user._id}`
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:8080/video");
        setUploadedVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [uploadedVideos]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a video file");
      return;
    }
    const userId = user._id;
    const order = ord;
    console.log(ord);
    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("userId", userId);
    formData.append("order", order);
    formData.append("description", description);
    try {
      await axios.post("http://localhost:8080/upload", formData);
      toast.success(
        "Video added successfully. The admin will review the content."
      );
    } catch (error) {
      toast.error("Error uploading video:", error);
    }
  };

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
  const handleVerify = async (videoId) => {
    setVerify(true);
    try {
      await axios.post(`http://localhost:8080/${videoId}/verify`, {
        verify,
      });
    } catch (error) {
      console.log("Error Verify video:", error);
    }
  };

  const handleDelete = async (videoId) => {
    try {
      await axios.delete(`http://localhost:8080/${videoId}/delete`);
    } catch (error) {
      console.log("Error Delete video:", error);
    }
  };

  return (
    <div className=" mb-14">
      {user && user.isAdmin && (
        <>
          <h1 className="text-center text-danger display-4 pt-5">
            Vérification
          </h1>

          {uploadedVideos.length > 0 ? (
            <div className="container d-flex flex-wrap justify-content-center">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {uploadedVideos.map((video, index) => (
                  <div
                    key={index}
                    className="col card shadow-sm border rounded-3 zoom-on-hover w-75"
                  >
                    <video
                      width="100%"
                      height="300"
                      className="card-img-top rounded-3"
                      controls
                    >
                      <source
                        src={`http://localhost:8080/${video.videoUrl}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div className="d-flex flex-row justify-content-between align-items-center">
                        <div className="d-flex flex-column">
                          <h5 className="card-title text-success fw-bold">
                            {video.createdBy.name}
                          </h5>
                          <p className="card-text text-muted">
                            {video.description}
                          </p>
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <i
                            onClick={() => handleLike(video._id)}
                            className="fas fa-solid fa-heart fs-3 text-danger mb-2"
                            style={{ cursor: "pointer" }}
                          ></i>
                          <p>{video.likes}</p>
                        </div>
                      </div>
                      <div className="d-flex flex-row justify-content-between align-items-center">
                        <button
                          onClick={() => handleVerify(video._id)}
                          className="btn btn-primary rounded-pill px-3"
                          disabled={video.verify}
                        >
                          <i className="fas fa-check"></i> Vérifier
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="btn btn-danger rounded-pill px-3"
                        >
                          <i className="fas fa-trash"></i> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <h1 className="text-center pt-5">Aucun vidéo pour le moment</h1>
          )}
        </>
      )}
      {user && !user.isAdmin && user.orders.length > 0 && (
        <div className="d-flex flex-column align-items-center pt-3">
          <input
            type="file"
            accept="video/*"
            hidden
            id="fileInput"
            className="bg-danger mb-3"
            onChange={handleFileChange}
            disabled={user.orders.length === 0}
          />
          <label htmlFor="fileInput">
            <i
              className="fas fa-plus-circle fs-2 p-2 rounded-circle"
              style={{ cursor: "pointer", backgroundColor: "#F1F6F9" }}
            ></i>
          </label>

          <ToastContainer />

          <select
            className="form-select w-auto my-3"
            value={ord}
            onChange={(e) => {
              console.log("Selected value:", e.target.value);
              setOrd(e.target.value);
            }}
          >
            <option>Choisir Votre Commande ID</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>
                {order._id}
              </option>
            ))}
          </select>

          <textarea
            className="form-control w-25 mb-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Votre Description"
          />

          <button
            className="btn btn-primary"
            style={{ fontSize: 20 }}
            onClick={handleUpload}
          >
            Ajouter Votre Réel
          </button>
        </div>
      )}
    </div>
  );
}

export default Story;
