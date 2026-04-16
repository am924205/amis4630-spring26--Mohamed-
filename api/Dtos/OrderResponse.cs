namespace BuckeyeMarketplaceApi.Dtos;

public class OrderItemResponse
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class OrderResponse
{
    public int Id { get; set; }
    public string ConfirmationNumber { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? UserEmail { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public List<OrderItemResponse> Items { get; set; } = new();
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
