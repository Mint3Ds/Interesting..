import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

const app = express();
const PORT: number = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API endpoint to get birthday config
app.get("/api/birthday-config", (req: Request, res: Response) => {
  const config = {
    birthdayPerson: "Steph",
    message: "Happy Birthday Steph! 🎉 Wishing you a day filled with joy, laughter, and all the amazing things that make you smile. You deserve all the happiness in the world! 💖",
    theme: {
      primaryColor: "#ff6b9d",
      secondaryColor: "#ffd93d",
      accentColor: "#6bcb77",
      backgroundColor: "#0a0a1a",
    },
    balloonCount: 20,
    confettiCount: 200,
    candleCount: 25,
  };
  res.json(config);
});

// Catch-all to serve the Single Page App
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🎂 Happy Birthday Website is LIVE!`);
  console.log(`🎉 Open your browser at: http://localhost:${PORT}`);
  console.log(`✨ Enjoy the celebration!\n`);
});

export default app;
