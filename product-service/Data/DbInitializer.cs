using ProductService.Models;

namespace ProductService.Data;

public static class DbInitializer
{
    public static void Seed(AppDbContext context)
    {
        if (context.Products.Any()) return;

        var products = new List<Product>
        {
            new()
            {
                Name = "Wireless Bluetooth Headphones",
                Price = 79.99m,
                Description = "Premium noise-cancelling over-ear headphones with 30-hour battery life and comfortable memory foam ear cushions.",
                Stock = 150
            },
            new()
            {
                Name = "Mechanical Gaming Keyboard",
                Price = 129.99m,
                Description = "RGB backlit mechanical keyboard with Cherry MX Blue switches, aluminum frame, and programmable macros.",
                Stock = 85
            },
            new()
            {
                Name = "4K Ultra HD Monitor",
                Price = 449.99m,
                Description = "27-inch 4K IPS display with HDR10 support, 144Hz refresh rate, and adjustable ergonomic stand.",
                Stock = 40
            },
            new()
            {
                Name = "USB-C Hub Adapter",
                Price = 39.99m,
                Description = "7-in-1 USB-C hub with HDMI 4K output, USB 3.0 ports, SD card reader, and 100W PD charging.",
                Stock = 200
            },
            new()
            {
                Name = "Portable SSD 1TB",
                Price = 89.99m,
                Description = "Ultra-fast portable solid state drive with USB 3.2 Gen 2, up to 1050MB/s read speed, shock-resistant.",
                Stock = 120
            },
            new()
            {
                Name = "Smart Webcam Pro",
                Price = 149.99m,
                Description = "4K webcam with auto-focus, built-in noise-cancelling microphone, privacy shutter, and low-light correction.",
                Stock = 65
            }
        };

        context.Products.AddRange(products);
        context.SaveChanges();
    }
}
