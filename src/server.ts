import express from "express";
import movieRoute from "./routes/movie.route";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/movies", movieRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
