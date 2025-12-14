var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();

// Enable WebApplicationFactory access for testing
public partial class Program { }
