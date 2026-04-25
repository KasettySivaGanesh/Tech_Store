using System.Diagnostics;

namespace ProductService.Middleware;

/// <summary>
/// Middleware that assigns/propagates X-Request-Id for distributed tracing
/// and logs each request with timing information.
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Use incoming request ID or generate a new one
        var requestId = context.Request.Headers["X-Request-Id"].FirstOrDefault()
                        ?? Guid.NewGuid().ToString("N")[..12];

        // Attach to response for correlation
        context.Response.Headers["X-Request-Id"] = requestId;

        // Add structured logging scope
        using (_logger.BeginScope(new Dictionary<string, object>
        {
            ["RequestId"] = requestId,
            ["Service"] = "product-service"
        }))
        {
            var sw = Stopwatch.StartNew();

            _logger.LogInformation(
                "[{RequestId}] → {Method} {Path}",
                requestId,
                context.Request.Method,
                context.Request.Path);

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "[{RequestId}] Unhandled exception during {Method} {Path}",
                    requestId,
                    context.Request.Method,
                    context.Request.Path);
                throw;
            }
            finally
            {
                sw.Stop();
                _logger.LogInformation(
                    "[{RequestId}] ← {Method} {Path} responded {StatusCode} in {Elapsed}ms",
                    requestId,
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    sw.ElapsedMilliseconds);
            }
        }
    }
}
