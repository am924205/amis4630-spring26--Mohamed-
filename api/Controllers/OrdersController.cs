using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BuckeyeMarketplaceApi.Data;
using BuckeyeMarketplaceApi.Dtos;
using BuckeyeMarketplaceApi.Models;
using BuckeyeMarketplaceApi.Services;

namespace BuckeyeMarketplaceApi.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    [HttpPost]
    public async Task<ActionResult<OrderResponse>> CreateOrder(CreateOrderRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || cart.Items.Count == 0)
            return BadRequest(new { message = "Cart is empty." });

        var orderItems = OrderCalculator.MapCartItemsToOrderItems(cart.Items);
        var total = orderItems.Sum(i => i.LineTotal);

        var order = new Order
        {
            UserId = userId,
            ConfirmationNumber = OrderCalculator.GenerateConfirmationNumber(),
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            Total = total,
            ShippingAddress = request.ShippingAddress,
            Items = orderItems
        };

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ToResponse(order));
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetMyOrders()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> GetById(int id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        // BOLA guard: non-admins can only see their own orders
        if (order.UserId != userId && !User.IsInRole("Admin"))
            return NotFound();

        return Ok(ToResponse(order));
    }

    // Admin: view all orders
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<OrderResponse>>> GetAll()
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        var userIds = orders.Select(o => o.UserId).Distinct().ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email);

        var list = orders.Select(o =>
        {
            var r = ToResponse(o);
            r.UserEmail = users.TryGetValue(o.UserId, out var email) ? email : null;
            return r;
        }).ToList();

        return Ok(list);
    }

    [HttpPut("{orderId:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(int orderId, UpdateOrderStatusRequest request)
    {
        var allowed = new[] { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };
        if (!allowed.Contains(request.Status))
            return BadRequest(new { message = $"Status must be one of: {string.Join(", ", allowed)}." });

        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return NotFound();

        order.Status = request.Status;
        await _context.SaveChangesAsync();
        return Ok(ToResponse(order));
    }

    private static OrderResponse ToResponse(Order o) => new()
    {
        Id = o.Id,
        ConfirmationNumber = o.ConfirmationNumber,
        UserId = o.UserId,
        OrderDate = o.OrderDate,
        Status = o.Status,
        Total = o.Total,
        ShippingAddress = o.ShippingAddress,
        Items = o.Items.Select(i => new OrderItemResponse
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            UnitPrice = i.UnitPrice,
            Quantity = i.Quantity,
            LineTotal = i.LineTotal
        }).ToList()
    };
}
