import request from "supertest";
import app from "./server";

describe("POST /webhook", () => {
  it("should return 400 if request body is empty", async () => {
    const response = await request(app).post("/webhook").send({});
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("should return 200 if request body is not empty", async () => {
    const response = await request(app)
      .post("/webhook")
      .send({ secretCode: "XYZ" });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Webhook received");
  });
});
