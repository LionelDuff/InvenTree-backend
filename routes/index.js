import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "InvenTree API" });
});

/* GET all products */
router.get("/products", async function (req, res, next) {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=0");
    const data = await response.json();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* GET Search products */
router.get("/products/:search", async function (req, res, next) {
  const { search } = req.params;
  try {
    const response = await fetch(
      `https://dummyjson.com/products/search?q=${search}`
    );
    const data = await response.json();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* Update product */
router.put("/products/:id", async function (req, res, next) {
  const { id } = req.params;
  const updatedProduct = req.body;

  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) {
      throw new Error("Failed to update product");
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

/* Delete product */
router.delete("/products/:id", async function (req, res, next) {
  const { id } = req.params;

  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete product");
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
