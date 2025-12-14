using Microsoft.AspNetCore.Builder;
using System.Linq;

namespace PianoPractice.Tests;

[TestClass]
public class WebAppFixture
{
    private static WebApplication? _app;

    public static string BaseUrl { get; private set; } = null!;

    [AssemblyInitialize]
    public static void Initialize(TestContext context)
    {
        var contentRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "src", "PianoPractice.Web"));
        _app = Program.BuildWebApplication(new[] { "--urls", "http://127.0.0.1:0" }, contentRoot);
        _app.StartAsync().GetAwaiter().GetResult();
        BaseUrl = _app.Urls.First().TrimEnd('/');
    }

    [AssemblyCleanup]
    public static void Cleanup()
    {
        if (_app is null)
        {
            return;
        }

        _app.StopAsync().GetAwaiter().GetResult();
        _app.DisposeAsync().AsTask().GetAwaiter().GetResult();
    }
}
