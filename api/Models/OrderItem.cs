using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuckeyeMarketplaceApi.Models;

public class OrderItem
{
    public int Id { get; set; }

    [ForeignKey("Order")]
    public int OrderId { get; set; }

    public int ProductId { get; set; }

    [Required]
    public string ProductName { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }

    public int Quantity { get; set; }

    public decimal LineTotal { get; set; }

    public Order Order { get; set; } = null!;
}
