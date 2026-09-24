import { describe, expect, it } from "vitest";

import request from "supertest";

import { creerApplication } from "../src/createApp";



describe("CORS pour WAM Studio", () => {

  it("expose les en-tetes CORS et CORP sur /health", async () => {

    const agent = creerApplication();

    const response = await request(agent.app)

      .get("/health")

      .set("Origin", "http://localhost:5002");



    expect(response.status).toBe(200);

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5002");

    expect(response.headers["cross-origin-resource-policy"]).toBe("cross-origin");

  });



  it("repond aux preflight OPTIONS", async () => {

    const agent = creerApplication();

    const response = await request(agent.app)

      .options("/upload")

      .set("Origin", "http://localhost:5002")

      .set("Access-Control-Request-Method", "POST")

      .set("Access-Control-Request-Headers", "X-Transfer-Id");



    expect(response.status).toBe(204);

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5002");

    expect(response.headers["access-control-allow-headers"]).toContain("X-Transfer-Id");

  });

});

