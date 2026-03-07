const request = require("supertest");

describe("Guestbook API", () => {
	let app;

	beforeEach(() => {
		jest.resetModules();
		// Mock the entire features module so the server imports our manual mock
		jest.mock("./features", () => ({
			featureClient: {
				getBooleanValue: jest.fn().mockResolvedValue(false),
			},
		}));
		app = require("./server");
	});

	afterEach(() => {
		jest.unmock("./features");
	});

	it("GET /api/entries returns an array of entries", async () => {
		const res = await request(app).get("/api/entries");
		expect(res.statusCode).toEqual(200);
		expect(Array.isArray(res.body)).toBeTruthy();
		expect(res.body).toHaveLength(1);
	});

	it("POST /api/entries adds a new entry", async () => {
		const newEntry = { name: "Test User", message: "Hello world" };
		const res = await request(app).post("/api/entries").send(newEntry);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("name", newEntry.name);
		expect(res.body).toHaveProperty("message", newEntry.message);
	});

	it("POST /api/entries includes aiReply field", async () => {
		const newEntry = { name: "Cosmonaut", message: "First orbit complete!" };
		const res = await request(app).post("/api/entries").send(newEntry);
		expect(res.statusCode).toEqual(201);
		expect(res.body).toHaveProperty("aiReply");
		// When flag is disabled, aiReply should be null
		expect(res.body.aiReply).toBeNull();
	});

	it("POST /api/entries without name returns 400", async () => {
		const newEntry = { message: "Hello without name" };
		const res = await request(app).post("/api/entries").send(newEntry);
		expect(res.statusCode).toEqual(400);
	});

	it("POST /api/entries without message returns 400", async () => {
		const newEntry = { name: "Test User" };
		const res = await request(app).post("/api/entries").send(newEntry);
		expect(res.statusCode).toEqual(400);
	});
});

describe("Summary API", () => {
	let app;

	beforeEach(() => {
		jest.resetModules();
		jest.mock("./features", () => ({
			featureClient: {
				getBooleanValue: jest.fn().mockResolvedValue(false),
			},
		}));
		app = require("./server");
	});

	afterEach(() => {
		jest.unmock("./features");
	});

	it("GET /api/summary returns JSON with summary and enabled fields", async () => {
		const res = await request(app).get("/api/summary");
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("summary");
		expect(res.body).toHaveProperty("enabled");
	});

	it("GET /api/summary returns enabled:false when flag is disabled", async () => {
		const res = await request(app).get("/api/summary");
		expect(res.statusCode).toEqual(200);
		expect(res.body.enabled).toBe(false);
		expect(res.body.summary).toBeNull();
	});
});
