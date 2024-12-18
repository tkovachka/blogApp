require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app"); // Import the app
const Blog = require("../model/blog"); // Import the Blog model

let mongoServer;

beforeAll(async () => {
    // Set up in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    // Tear down MongoDB and disconnect
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear test data
    await Blog.deleteMany({});
});

describe("Blog API Tests", () => {
    it("should create a new blog post", async () => {
        const newBlog = {
            title: "Test Blog",
            image: "https://via.placeholder.com/150",
            body: "This is a test blog post.",
        };

        const response = await request(app).post("/blogs").send({ blog: newBlog });

        expect(response.status).toBe(302); // Redirect after creation
        const blog = await Blog.findOne({ title: "Test Blog" });
        expect(blog).toBeTruthy();
        expect(blog.body).toBe(newBlog.body);
    });

    it("should fetch all blog posts", async () => {
        const blogs = [
            { title: "Blog 1", image: "https://via.placeholder.com/150", body: "Blog 1 body" },
            { title: "Blog 2", image: "https://via.placeholder.com/150", body: "Blog 2 body" },
        ];
        await Blog.insertMany(blogs);

        const response = await request(app).get("/blogs");

        expect(response.status).toBe(200);
        expect(response.text).toContain("Blog 1");
        expect(response.text).toContain("Blog 2");
    });

    it("should fetch a single blog post", async () => {
        const blog = await Blog.create({
            title: "Single Blog",
            image: "https://via.placeholder.com/150",
            body: "Single blog body",
        });

        const response = await request(app).get(`/blogs/${blog._id}`);

        expect(response.status).toBe(200);
        expect(response.text).toContain("Single Blog");
    });

    it("should update a blog post", async () => {
        const blog = await Blog.create({
            title: "Update Blog",
            image: "https://via.placeholder.com/150",
            body: "Before update",
        });

        const updatedData = { blog: { title: "Updated Blog", body: "After update" } };
        const response = await request(app).put(`/blogs/${blog._id}`).send(updatedData);

        expect(response.status).toBe(302);
        const updatedBlog = await Blog.findById(blog._id);
        expect(updatedBlog.title).toBe("Updated Blog");
        expect(updatedBlog.body).toBe("After update");
    });

    it("should delete a blog post", async () => {
        const blog = await Blog.create({
            title: "Delete Blog",
            image: "https://via.placeholder.com/150",
            body: "To be deleted",
        });

        const response = await request(app).delete(`/blogs/${blog._id}`);

        expect(response.status).toBe(302);
        const deletedBlog = await Blog.findById(blog._id);
        expect(deletedBlog).toBeNull();
    });
});
