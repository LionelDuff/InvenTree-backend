import express from "express";
import "@shopify/shopify-api/adapters/node";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const router = express.Router();

const shopify = shopifyApi({
  apiKey: process.env.API_KEY || "fake-key",
  apiSecretKey: process.env.API_SECRET || "fake-secret",
  scopes: process.env.SCOPES || [],
  hostName: "localhost",
  apiVersion: LATEST_API_VERSION,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Get products from Shopify */
router.get("/products", async (req, res) => {
  try {
    const session = {
      shop: process.env.SHOP,
      accessToken: process.env.ADMIN_API_ACCESS_TOKEN,
    };

    const client = new shopify.clients.Rest({ session });
    const response = await client.get({ path: "products" });

    res.json(response.body.products);
  } catch (err) {
    console.error("Erreur Shopify :", err);
    res.status(500).send("Erreur API Shopify");
  }
});

/* Get stock level for a specific product */
router.get("/stock/:inventoryItemId", async (req, res) => {
  try {
    const session = {
      shop: process.env.SHOP,
      accessToken: process.env.ADMIN_API_ACCESS_TOKEN,
    };

    const client = new shopify.clients.Rest({ session });

    /* fetch inventory levels for a specific inventory item */
    const inventoryItemId = req.params.inventoryItemId;
    const inventory = await client.get({
      path: "inventory_levels",
      query: {
        inventory_item_ids: inventoryItemId,
      },
    });

    res.json(inventory);
    console.log(inventory.body.inventory_levels[0].available);
  } catch (error) {
    console.error("Erreur récupération stock :", error);
    res.status(500).send("Erreur récupération stock");
  }
});

/* Update stock level for a specific inventory item */
router.put("/stock/:inventoryItemId", async (req, res) => {
  try {
    const session = {
      shop: process.env.SHOP,
      accessToken: process.env.ADMIN_API_ACCESS_TOKEN,
    };

    const client = new shopify.clients.Rest({ session });

    const inventoryItemId = req.params.inventoryItemId;
    const newQuantity = req.body.quantity;

    if (!newQuantity && newQuantity !== 0) {
      return res
        .status(400)
        .json({ error: "La quantité est requise dans le body." });
    }
    /* fetch inventory levels for a specific inventory item */
    const inventory = await client.get({
      path: "inventory_levels",
      query: {
        inventory_item_ids: inventoryItemId,
      },
    });

    /* update stock level */
    const response = await client.post({
      path: "inventory_levels/set",
      data: {
        inventory_item_id: inventoryItemId,
        location_id: inventory.body.inventory_levels[0].location_id,
        available: newQuantity,
      },
      type: "application/json",
    });

    res.json({
      message: "✅ Stock mis à jour avec succès",
      response: response.body,
    });
  } catch (error) {
    console.error("Erreur mise à jour du stock :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du stock." });
  }
});

export default router;
