import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import morgan from "morgan";
import { body, validationResult } from "express-validator";
import errorHandler from "./middleware/errorHandler";
import { getDb } from "./firebase";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add logging middleware
app.use(morgan("combined"));

// Middleware to parse form data
const upload = multer();

app.post(
  "/webhook",
  upload.none(),
  [
    // Custom validation to ensure the body is not empty
    body().custom((value, { req }) => {
      if (Object.keys(req.body).length === 0) {
        throw new Error("Request body must not be empty");
      }
      return true;
    }),
  ],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("Error in validation");
        res.status(400).json({ errors: errors.array() });
      } else {
        // Store the full payload because we don't know what fields will be sent
        const db = await getDb();

        await db.collection("webhookPayloads").add({
          payload: req.body,
          receivedAt: new Date(),
        });

        res.status(200).json({ success: true, message: "Webhook received" });
      }
    } catch (e) {
      console.error("Error processing webhook: ", e);
      next(e);
    }
  }
);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Use the error handling middleware
app.use(errorHandler);

export default app;
