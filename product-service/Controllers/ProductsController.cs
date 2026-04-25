using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Dtos;
using ProductService.Models;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(AppDbContext context, ILogger<ProductsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/products — List all products
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        _logger.LogInformation("Fetching all products");
        var products = await _context.Products
            .OrderBy(p => p.Id)
            .ToListAsync();
        return Ok(products);
    }

    /// <summary>
    /// GET /api/products/{id} — Get a single product
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        _logger.LogInformation("Fetching product with ID {ProductId}", id);

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            _logger.LogWarning("Product with ID {ProductId} not found", id);
            return NotFound(new { error = "Product not found", productId = id });
        }

        return Ok(product);
    }

    /// <summary>
    /// POST /api/products — Create a new product
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _logger.LogInformation("Creating new product: {ProductName}", dto.Name);

        var product = new Product
        {
            Name = dto.Name,
            Price = dto.Price,
            Description = dto.Description,
            Stock = dto.Stock
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created product with ID {ProductId}", product.Id);
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    /// <summary>
    /// PUT /api/products/{id} — Update an existing product (partial update)
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Product>> UpdateProduct(int id, [FromBody] ProductUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _logger.LogInformation("Updating product with ID {ProductId}", id);

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            _logger.LogWarning("Product with ID {ProductId} not found for update", id);
            return NotFound(new { error = "Product not found", productId = id });
        }

        if (dto.Name != null) product.Name = dto.Name;
        if (dto.Price.HasValue) product.Price = dto.Price.Value;
        if (dto.Description != null) product.Description = dto.Description;
        if (dto.Stock.HasValue) product.Stock = dto.Stock.Value;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated product with ID {ProductId}", product.Id);
        return Ok(product);
    }

    /// <summary>
    /// DELETE /api/products/{id} — Delete a product
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        _logger.LogInformation("Deleting product with ID {ProductId}", id);

        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            _logger.LogWarning("Product with ID {ProductId} not found for deletion", id);
            return NotFound(new { error = "Product not found", productId = id });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted product with ID {ProductId}", id);
        return NoContent();
    }
}
