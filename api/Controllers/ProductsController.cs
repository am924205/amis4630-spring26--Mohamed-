using Microsoft.AspNetCore.Mvc;
using BuckeyeMarketplaceApi.Models;

namespace BuckeyeMarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products = new()
    {
        new Product
        {
            Id = 1,
            Title = "Discrete Mathematics Textbook",
            Description = "Used textbook for CSE 2321. Some highlighting but overall good condition. Covers logic, sets, graphs, and combinatorics.",
            Price = 45.00m,
            Category = "Textbooks",
            SellerName = "Marcus J.",
            PostedDate = new DateTime(2026, 2, 10),
            ImageUrl = "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 2,
            Title = "Apple MacBook Air M2",
            Description = "2023 MacBook Air, Space Gray, 8GB RAM, 256GB SSD. Barely used — switched to a desktop setup. Includes charger.",
            Price = 749.99m,
            Category = "Electronics",
            SellerName = "Aisha R.",
            PostedDate = new DateTime(2026, 2, 14),
            ImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 3,
            Title = "IKEA Shelf",
            Description = "White 4-cube shelf, perfect for dorm or apartment. Minor scuff on the bottom. Pick up near campus.",
            Price = 30.00m,
            Category = "Furniture",
            SellerName = "Jake T.",
            PostedDate = new DateTime(2026, 2, 18),
            ImageUrl = "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 4,
            Title = "OSU Hoodie (XL)",
            Description = "Official Ohio State hoodie, size XL. Worn a few times, still looks brand new. Scarlet and gray.",
            Price = 55.00m,
            Category = "Clothing",
            SellerName = "Destiny W.",
            PostedDate = new DateTime(2026, 2, 20),
            ImageUrl = "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 5,
            Title = "TI-84 Plus CE Graphing Calculator",
            Description = "Required for several math and science courses. Works perfectly, comes with USB cable. Selling because I graduated from those courses.",
            Price = 60.00m,
            Category = "Electronics",
            SellerName = "Chris L.",
            PostedDate = new DateTime(2026, 2, 22),
            ImageUrl = "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 6,
            Title = "Principles of Marketing",
            Description = "Lightly used for BUSMKT 2320. No writing or highlights. Comes with MyLab access card.",
            Price = 38.00m,
            Category = "Textbooks",
            SellerName = "Nina P.",
            PostedDate = new DateTime(2026, 2, 25),
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 7,
            Title = "Standing Desk",
            Description = "Adjustable standing desk riser, fits on top of any desk. Great for long study sessions. Black finish.",
            Price = 85.00m,
            Category = "Furniture",
            SellerName = "Marcus J.",
            PostedDate = new DateTime(2026, 2, 28),
            ImageUrl = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 8,
            Title = "Sony WH-1000XM5 Headphones",
            Description = "Noise-canceling over-ear headphones. Perfect for studying in Thompson Library. Includes case and cable.",
            Price = 199.99m,
            Category = "Electronics",
            SellerName = "Aisha R.",
            PostedDate = new DateTime(2026, 3, 1),
            ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 9,
            Title = "Buckeye Football Hoodie (L)",
            Description = "Officially licensed Ohio State football hoodie, size Large. Comfortable and warm. Go Bucks!",
            Price = 35.00m,
            Category = "Clothing",
            SellerName = "Jake T.",
            PostedDate = new DateTime(2026, 3, 2),
            ImageUrl = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop"
        },
        new Product
        {
            Id = 10,
            Title = "Introduction to Economics",
            Description = "Intro economics textbook. Used for ECON 2001. Some tabs on pages but no writing inside. Covers micro and macro fundamentals.",
            Price = 50.00m,
            Category = "Textbooks",
            SellerName = "Chris L.",
            PostedDate = new DateTime(2026, 3, 3),
            ImageUrl = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
        }
    };

    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetAll()
    {
        return Ok(Products);
    }

    [HttpGet("{id}")]
    public ActionResult<Product> GetById(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        if (product == null)
            return NotFound();

        return Ok(product);
    }
}
