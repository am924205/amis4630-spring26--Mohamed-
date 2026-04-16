using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuckeyeMarketplaceApi.Data;
using BuckeyeMarketplaceApi.Dtos;
using BuckeyeMarketplaceApi.Models;

namespace BuckeyeMarketplaceApi.Controllers;

[ApiController]
[Authorize]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    // GET /api/cart
    [HttpGet]
    public async Task<ActionResult<CartResponse>> GetCart()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            return Ok(new CartResponse
            {
                Id = 0,
                UserId = userId,
                Items = new List<CartItemResponse>(),
                TotalItems = 0,
                Subtotal = 0,
                Total = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

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
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null)
            return NotFound(new { message = "Product not found." });

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Carts.Add(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
        }
        else
        {
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
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .Include(ci => ci.Product)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

        if (cartItem == null)
            return NotFound();

        if (cartItem.Cart.UserId != userId)
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
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

        if (cartItem == null)
            return NotFound();

        if (cartItem.Cart.UserId != userId)
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
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
            return NoContent();

        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
