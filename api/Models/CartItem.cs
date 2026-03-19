using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BuckeyeMarketplaceApi.Models;

public class CartItem
{
    public int Id { get; set; }

    [ForeignKey("Cart")]
    public int CartId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [Required]
    public int Quantity { get; set; }

    public Cart Cart { get; set; } = null!;

    public Product Product { get; set; } = null!;
}
