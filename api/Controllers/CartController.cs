using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuckeyeMarketplaceApi.Data;
using BuckeyeMarketplaceApi.Dtos;
using BuckeyeMarketplaceApi.Models;

namespace BuckeyeMarketplaceApi.Controllers;

[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private const string CurrentUserId = "default-user";
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/cart
    [HttpGet]
    public async Task<ActionResult<CartResponse>> GetCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart == null)
            return NotFound();

        var response = new CartResponse
        {
            Id = cart.Id,
            UserId = cart.UserId,
            Items = cart.Items.Select(i => new CartItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product.Title,
                Price = i.Product.Price,
                ImageUrl = i.Product.ImageUrl,
                Quantity = i.Quantity,
                LineTotal = i.Product.Price * i.Quantity
            }).ToList(),
            TotalItems = cart.Items.Sum(i => i.Quantity),
            Subtotal = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            Total = cart.Items.Sum(i => i.Product.Price * i.Quantity),
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt
        };

        return Ok(response);
    }

    // POST /api/cart
    [HttpPost]
    public async Task<ActionResult<CartItemResponse>> AddToCart(AddToCartRequest request)
    {
        // Verify the product exists
        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
            return NotFound(new { message = "Product not found." });

        // Find or create cart for the current user (upsert container pattern)
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = CurrentUserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
        }

        // Check if a CartItem for this productId already exists (upsert item pattern)
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            // Update existing item quantity
            existingItem.Quantity += request.Quantity;
        }
        else
        {
            // Create new CartItem
            existingItem = new CartItem
            {
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            cart.Items.Add(existingItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var response = new CartItemResponse
        {
            Id = existingItem.Id,
            ProductId = existingItem.ProductId,
            ProductName = product.Title,
            Price = product.Price,
            ImageUrl = product.ImageUrl,
            Quantity = existingItem.Quantity,
            LineTotal = product.Price * existingItem.Quantity
        };

        return CreatedAtAction(nameof(GetCart), response);
    }

    // PUT /api/cart/{cartItemId}
    [HttpPut("{cartItemId:int}")]
    public async Task<ActionResult<CartItemResponse>> UpdateCartItem(int cartItemId, UpdateCartItemRequest request)
    {
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

        if (cartItem == null)
            return NotFound();

        // Verify the CartItem belongs to the current user's cart
        if (cartItem.Cart.UserId != CurrentUserId)
            return NotFound();

        cartItem.Quantity = request.Quantity;
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var response = new CartItemResponse
        {
            Id = cartItem.Id,
            ProductId = cartItem.ProductId,
            ProductName = cartItem.Product.Title,
            Price = cartItem.Product.Price,
            ImageUrl = cartItem.Product.ImageUrl,
            Quantity = cartItem.Quantity,
            LineTotal = cartItem.Product.Price * cartItem.Quantity
        };

        return Ok(response);
    }

    // DELETE /api/cart/{cartItemId}
    [HttpDelete("{cartItemId:int}")]
    public async Task<IActionResult> RemoveCartItem(int cartItemId)
    {
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

        if (cartItem == null)
            return NotFound();

        // Verify the CartItem belongs to the current user's cart
        if (cartItem.Cart.UserId != CurrentUserId)
            return NotFound();

        cartItem.Cart.UpdatedAt = DateTime.UtcNow;
        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/cart/clear
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == CurrentUserId);

        if (cart == null)
            return NotFound();

        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
