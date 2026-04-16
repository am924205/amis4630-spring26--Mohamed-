using BuckeyeMarketplaceApi.Models;

namespace BuckeyeMarketplaceApi.Services;

public static class OrderCalculator
{
    public static decimal CalculateTotal(IEnumerable<CartItem> items)
    {
        return items.Sum(i => i.Product.Price * i.Quantity);
    }

    public static string GenerateConfirmationNumber()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        return $"BM-{timestamp}-{random}";
    }

    public static List<OrderItem> MapCartItemsToOrderItems(IEnumerable<CartItem> cartItems)
    {
        return cartItems.Select(ci => new OrderItem
        {
            ProductId = ci.ProductId,
            ProductName = ci.Product.Title,
            UnitPrice = ci.Product.Price,
            Quantity = ci.Quantity,
            LineTotal = ci.Product.Price * ci.Quantity
        }).ToList();
    }
}
