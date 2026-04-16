using BuckeyeMarketplaceApi.Models;
using BuckeyeMarketplaceApi.Services;
using Xunit;

namespace BuckeyeMarketplaceApi.Tests;

public class OrderCalculatorTests
{
    [Fact]
    public void CalculateTotal_SumsPriceTimesQuantity()
    {
        var items = new[]
        {
            new CartItem { Quantity = 2, Product = new Product { Price = 10.00m } },
            new CartItem { Quantity = 3, Product = new Product { Price = 4.50m } },
        };

        var total = OrderCalculator.CalculateTotal(items);

        Assert.Equal(33.50m, total);
    }

    [Fact]
    public void CalculateTotal_EmptyCart_ReturnsZero()
    {
        Assert.Equal(0m, OrderCalculator.CalculateTotal(Array.Empty<CartItem>()));
    }

    [Fact]
    public void MapCartItemsToOrderItems_CopiesSnapshotFields()
    {
        var items = new[]
        {
            new CartItem
            {
                ProductId = 1,
                Quantity = 2,
                Product = new Product { Id = 1, Title = "Hoodie", Price = 25.00m }
            }
        };

        var orderItems = OrderCalculator.MapCartItemsToOrderItems(items);

        var only = Assert.Single(orderItems);
        Assert.Equal(1, only.ProductId);
        Assert.Equal("Hoodie", only.ProductName);
        Assert.Equal(25.00m, only.UnitPrice);
        Assert.Equal(2, only.Quantity);
        Assert.Equal(50.00m, only.LineTotal);
    }

    [Fact]
    public void GenerateConfirmationNumber_StartsWithPrefix()
    {
        var confirmation = OrderCalculator.GenerateConfirmationNumber();
        Assert.StartsWith("BM-", confirmation);
    }
}
