var app = Program.BuildWebApplication(args);
app.Run();

public partial class Program
{
    public static WebApplication BuildWebApplication(string[]? args = null, string? contentRoot = null)
    {
        var builder = contentRoot is null
            ? WebApplication.CreateBuilder(args ?? Array.Empty<string>())
            : WebApplication.CreateBuilder(new WebApplicationOptions
            {
                Args = args ?? Array.Empty<string>(),
                ContentRootPath = contentRoot
            });

        var app = builder.Build();
        Configure(app);
        return app;
    }

    private static void Configure(WebApplication app)
    {
        app.UseDefaultFiles();
        app.UseStaticFiles();
    }
}
