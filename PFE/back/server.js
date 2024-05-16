const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
const path = require("path");
const http = require("http");
require("dotenv").config();
require("./connection");
const server = http.createServer(app);
const Coupon = require("./models/Coupon");
const Comment = require("./models/Comment");
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
});

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const imageRoutes = require("./routes/imageRoutes");
const Story = require("./models/Story");
const User = require("./models/User");
const Product = require("./models/Product");
const paymentRoutes = require("./routes/PaymentOnline");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/images", imageRoutes);
app.use("/api", paymentRoutes);

// Helper function to calculate discounted price
function calculateDiscountedPrice(product) {
  const discountPercentage = 25; // Adjust the discount percentage as needed
  const discountedPrice = product.price * (1 - discountPercentage / 100);

  // Limit the discounted price to three decimal places
  return parseFloat(discountedPrice.toFixed(3));
}

const generateCouponCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const codeLength = 8; // Longueur du code du coupon
  let couponCode = "";

  // Générer le code aléatoire en sélectionnant des caractères aléatoires dans la chaîne de caractères
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }

  return couponCode;
};

// Keep track of uploaded videos
const uploadedVideos = [];

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname + "-" + uniqueSuffix;
    uploadedVideos.push(filename);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("video"), async (req, res) => {
  const videoPath = req.file.path;
  const { userId } = req.body;
  const { order } = req.body;
  const { description } = req.body;
  console.log(order);

  try {
    const newStory = new Story({
      videoUrl: videoPath,
      createdBy: userId,
      order: order,
      description: description,
    });

    const savedStory = await newStory.save();

    res.json({ videoPath: savedStory.videoUrl, likes: savedStory.likes });
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement de la vidéo dans la base de données:",
      error
    );
    res.status(500).send("Internal Server Error");
  }
});

app.use("/uploads", express.static("uploads"));

app.get("/videos", async (req, res) => {
  const sort = { _id: -1 };
  try {
    const videos = await Story.find({ verify: true }, { __v: 0 })
      .populate("createdBy")
      .sort(sort); // Filter videos where verify is true

    res.json({ videos });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des vidéos depuis la base de données:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/videos/:id/user", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id); // Corrected from User.find(id) to User.findById(id)
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const videos = await Story.find(
      { verify: true, createdBy: user._id },
      { __v: 0 }
    );
    // Fetch videos where verify is true and createdBy matches the user's _id

    res.json({ UserVideo: videos });
  } catch (error) {
    console.error("Error fetching user's videos:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/video", async (req, res) => {
  try {
    const videos = await Story.find({}, { __v: 0 }).populate("createdBy");

    res.json({ videos });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des vidéos depuis la base de données:",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/video/:id/comment", async (req, res) => {
  const io = req.app.get("socketio");
  const videoId = req.params.id;
  const { text, userId } = req.body;

  try {
    // Find the video
    const video = await Story.findById(videoId).populate("createdBy");
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the comment with user details
    const comment = new Comment({
      text,
      commenter: {
        id: user._id,
        name: user.name,
        avatar: user.picture,
        // Add other user details if needed
      },
    });

    // Send notification to the video creator if the commenter is not the video creator
    if (user._id.toString() !== video.createdBy._id.toString()) {
      const notification = {
        status: "unread",
        message: `Nouveau Commentaire par ${user.name} Sur Votre Réel `,
        time: new Date(),
      };
      io.sockets.emit("comment", notification, video.createdBy._id);
    }

    // Save the comment and video
    video.comments.push(comment);
    await video.save();

    res.status(201).json({ message: "Comment posted successfully", comment });
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/video/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const video = await Story.findOne({ _id: id }).populate("order");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (video.membersLiked.includes(userId)) {
      return res.status(400).json({ message: "User already liked the video" });
    }

    video.likes += 1;
    video.membersLiked.push(userId);

    if (video.likes > 1) {
      // Crée un coupon lorsque la vidéo atteint 50 likes
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      const discountValue = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

      // Créer un coupon avec un code généré, un produit et un utilisateur associé
      const couponCode = generateCouponCode(); // Générer un code de coupon
      const coupon = new Coupon({
        userId: user._id,
        code: couponCode,
        discountValue: discountValue, // Valeur de réduction de 10% (modifiable selon les besoins)
        expirationDate: expirationDate,
        isActive: true, // Par défaut, le coupon est actif
      });

      // Sauvegarder le coupon dans la base de données
      await coupon.save();
    }

    await video.save();

    res.json({ video });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/videos/:videoId/comments", async (req, res) => {
  const { videoId } = req.params;
  const video = await Story.findById(videoId);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const comments = video.comments; // assume each video has a comments array

  return res.json({ comments });
});
/*
app.post("/video/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    // Code pour récupérer la vidéo, vérifier le nombre de likes, etc.

    // Si le nombre de likes dépasse 100
    if (video.likes >= 100 && video.order) {
      const productsIds = video.order.products;

      // Pour chaque produit dans la commande
      for (const productId of Object.keys(productsIds)) {
        // Générer un code de coupon unique
        const couponCode = generateCouponCode();

        // Créer un coupon pour le produit et l'utilisateur avec le code généré
        const coupon = new Coupon({
          product: productId,
          user: userId,
          couponCode: couponCode,
          discountedPrice: calculateDiscountedPrice(productId), // Calculer le prix réduit du produit
          createdAt: new Date()
        });

        // Sauvegarder le coupon dans la base de données
        await coupon.save();
      }
    }

    // Code pour mettre à jour la vidéo, ajouter l'utilisateur aux membres aimés, etc.

    // Sauvegarder la vidéo après avoir effectué toutes les opérations
    await video.save();

    res.json({ video });
  } catch (error) {
    console.error("Error processing video likes:", error);
    res.status(500).send("Internal Server Error");
  }
});
*/

app.get("/coupon/:userId", async (req, res) => {
  const { userId } = req.params;
  const currentDate = new Date();

  try {
    // Effectuez une requête pour supprimer les coupons expirés
    await Coupon.deleteMany({
      expirationDate: { $lt: currentDate },
    });
    // Rechercher les coupons associés à l'utilisateur
    const coupons = await Coupon.find({ userId: userId, isActive: true });
    console.log(coupons);

    res.json({ coupons });
  } catch (error) {
    console.error("Error fetching user coupons:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/story/:id", async (req, res) => {
  const storyId = req.params.id;

  try {
    // Find the story by its ID and populate the membersLiked field
    const story = await Story.findById(storyId).populate("membersLiked");

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.status(200).json({ story });
  } catch (error) {
    console.error("Error retrieving story:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/:storyId/verify", async (req, res) => {
  const { storyId } = req.params;
  const { verify } = req.body;

  try {
    // Update the verification status in the database
    const updatedStory = await Story.findByIdAndUpdate(
      { _id: storyId },
      { verify }
    );

    // Send a response indicating success
    res.json({ updatedStory });
  } catch (error) {
    console.error("Error verifying story:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/:videoId/delete", async (req, res) => {
  const videoId = req.params.videoId;

  try {
    // Find the video by ID and delete it
    const deletedVideo = await Story.findByIdAndDelete(videoId);

    if (deletedVideo) {
      res.json({ message: "Video deleted successfully", video: deletedVideo });
    } else {
      res.status(404).json({ error: "Video not found" });
    }
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/apply-coupon/:userId", async (req, res) => {
  const { couponCode } = req.body;
  const { userId } = req.params;
  console.log(couponCode);

  try {
    // Find the coupon with the provided coupon code
    const coupon = await Coupon.findOne({ couponCode }).populate("product");
    const user = await User.findById(userId);
    const userCart = user.cart;

    // Check if a coupon with the provided code exists
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if the coupon has expired
    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check if the coupon has already been used
    if (coupon.used) {
      return res.status(400).json({ message: "Coupon has already been used" });
    }

    if (userCart[coupon.product._id]) {
      const quantity = userCart[coupon.product._id];
      const productPrice = quantity * coupon.product.price;
      const discountedPrice = quantity * coupon.discountedPrice;

      // Adjust the cart's total price based on the difference
      userCart.total -= productPrice;
      userCart.total += discountedPrice;
    }
    user.cart = userCart;
    user.markModified("cart");
    console.log(user.cart.total);
    await user.save();
    // If coupon is valid, return the entire coupon object
    res.json({ coupon });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/coupon/:id", async (req, res) => {
  const couponId = req.params.id;

  // Suppose que vous avez un module `coupons` qui gère les coupons
  const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

  if (deletedCoupon) {
    res.status(200).json({ message: "Coupon supprimé avec succès" });
  } else {
    res.status(404).json({ message: "Coupon non trouvé" });
  }
});
app.put("/updateCoupon/:id", async (req, res) => {
  const couponId = req.params.id;
  const { code, expirationDate, discountValue, isActive } = req.body;

  try {
    // Recherchez le coupon par son ID
    let coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon non trouvé" });
    }

    // Mettez à jour les champs du coupon avec les nouvelles valeurs
    coupon.code = code;
    coupon.expirationDate = expirationDate;
    coupon.discountValue = discountValue;
    coupon.isActive = isActive;

    // Enregistrez les modifications dans la base de données
    await coupon.save();

    // Réponse avec le coupon mis à jour
    res.status(200).json(coupon);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du coupon :", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour du coupon" });
  }
});

server.listen(8080, () => {
  console.log("server running at port", 8080);
});

app.set("socketio", io);
