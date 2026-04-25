using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ---------- Logging ----------
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ---------- Controllers ----------
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ---------- Database ----------
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("X-Request-Id");
    });
});

var app = builder.Build();

// ---------- Database initialization ----------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Applying database schema...");
        db.Database.EnsureCreated();
        logger.LogInformation("Seeding database...");
        DbInitializer.Seed(db);
        logger.LogInformation("Database ready.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error initializing database. Ensure PostgreSQL is running and the connection string is correct.");
    }
}

// ---------- Middleware pipeline ----------
app.UseCors();
app.UseMiddleware<RequestLoggingMiddleware>();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://+:5001";
app.Urls.Clear();
app.Urls.Add(port);

app.Logger.LogInformation("Product Service starting on {Urls}", string.Join(", ", app.Urls));
app.Run();
