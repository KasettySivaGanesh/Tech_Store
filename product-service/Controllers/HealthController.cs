using Microsoft.AspNetCore.Mvc;
using ProductService.Data;

namespace ProductService.Controllers;

/// <summary>
/// Health check endpoints for Kubernetes liveness and readiness probes.
/// /api/health  → liveness probe (is the process alive?)
/// /api/ready   → readiness probe (can it serve traffic? checks DB)
/// </summary>
[ApiController]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(AppDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Liveness probe — returns 200 if the process is running
    /// </summary>
    [HttpGet("api/health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            service = "product-service",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Readiness probe — returns 200 if the service can accept traffic (DB connected)
    /// </summary>
    [HttpGet("api/ready")]
    public async Task<IActionResult> Ready()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (canConnect)
            {
                return Ok(new
                {
                    status = "ready",
                    service = "product-service",
                    database = "connected",
                    timestamp = DateTime.UtcNow
                });
            }

            return StatusCode(503, new
            {
                status = "not_ready",
                service = "product-service",
                database = "cannot_connect",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Readiness check failed — database connection error");
            return StatusCode(503, new
            {
                status = "not_ready",
                service = "product-service",
                database = "error",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
