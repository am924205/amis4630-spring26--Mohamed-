using Microsoft.EntityFrameworkCore;
using BuckeyeMarketplaceApi.Models;

namespace BuckeyeMarketplaceApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
}
