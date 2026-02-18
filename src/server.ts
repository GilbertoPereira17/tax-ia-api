import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import ragRoutes from "./routes/rag";
import kagRoutes from "./routes/kag";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use("/rag", ragRoutes);
app.use("/kag", kagRoutes);

// Rota de Healthcheck
app.get("/", (req, res) => {
    res.send("TaxIA API is running 🚀");
});

// Export para o Vercel (Serverless)
export default app;

// Só roda o listen se estiver rodando localmente (não no Vercel)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
