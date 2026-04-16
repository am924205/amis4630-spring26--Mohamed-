using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BuckeyeMarketplaceApi.Models;

namespace BuckeyeMarketplaceApi.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
        builder.Entity<Order>().Property(o => o.Total).HasPrecision(18, 2);
        builder.Entity<OrderItem>().Property(o => o.UnitPrice).HasPrecision(18, 2);
        builder.Entity<OrderItem>().Property(o => o.LineTotal).HasPrecision(18, 2);
    }
}
