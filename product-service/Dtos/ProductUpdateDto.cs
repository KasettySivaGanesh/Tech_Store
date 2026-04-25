using System.ComponentModel.DataAnnotations;

namespace ProductService.Dtos;

public class ProductUpdateDto
{
    [MaxLength(200)]
    public string? Name { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero")]
    public decimal? Price { get; set; }

    public string? Description { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stock cannot be negative")]
    public int? Stock { get; set; }
}
