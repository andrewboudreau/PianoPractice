using Microsoft.AspNetCore.Mvc.Testing;

namespace PianoPractice.Tests;

[TestClass]
public class WebAppFixture
{
    private static WebApplicationFactory<Program>? _factory;
    private static HttpClient? _client;

    public static string BaseUrl { get; private set; } = null!;

    [AssemblyInitialize]
    public static void Initialize(TestContext context)
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
        BaseUrl = _client.BaseAddress!.ToString().TrimEnd('/');
    }

    [AssemblyCleanup]
    public static void Cleanup()
    {
        _client?.Dispose();
        _factory?.Dispose();
    }
}
