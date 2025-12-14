using Microsoft.Playwright.MSTest;
using System.Text.RegularExpressions;

namespace PianoPractice.Tests;

[TestClass]
public class MetronomeTests : PageTest
{
    [TestMethod]
    public async Task HomePage_LoadsSuccessfully()
    {
        await Page.GotoAsync(WebAppFixture.BaseUrl);

        var title = await Page.TitleAsync();
        Assert.AreEqual("Piano Practice", title);

        // Check that the metronome link exists
        var metronomeLink = Page.Locator("a[href='metronome.html']");
        await Expect(metronomeLink).ToBeVisibleAsync();
    }

    [TestMethod]
    public async Task Metronome_CanChangeBpm()
    {
        await Page.GotoAsync($"{WebAppFixture.BaseUrl}/metronome.html");

        // Initial BPM should be 120
        var bpmDisplay = Page.Locator("#bpmDisplay");
        await Expect(bpmDisplay).ToHaveTextAsync("120");

        // Click the + button to increase BPM
        await Page.ClickAsync("#bpmUp");
        await Expect(bpmDisplay).ToHaveTextAsync("121");

        // Click the - button to decrease BPM
        await Page.ClickAsync("#bpmDown");
        await Page.ClickAsync("#bpmDown");
        await Expect(bpmDisplay).ToHaveTextAsync("119");
    }

    [TestMethod]
    public async Task Metronome_CanStartAndStop()
    {
        await Page.GotoAsync($"{WebAppFixture.BaseUrl}/metronome.html");

        var playBtn = Page.Locator("#playBtn");
        var playingRegex = new Regex("\\bplaying\\b");

        await Expect(playBtn).Not.ToHaveAttributeAsync("class", playingRegex);

        await playBtn.ClickAsync();
        await Expect(playBtn).ToHaveAttributeAsync("class", playingRegex);

        await playBtn.ClickAsync();
        await Expect(playBtn).Not.ToHaveAttributeAsync("class", playingRegex);
    }

    [TestMethod]
    public async Task Practice_LoadsSuccessfully()
    {
        await Page.GotoAsync($"{WebAppFixture.BaseUrl}/practice.html");

        var title = await Page.TitleAsync();
        StringAssert.Contains(title, "Finger Practice");

        // Check keyboard is visible
        var keyboard = Page.Locator("#keyboard");
        await Expect(keyboard).ToBeVisibleAsync();

        // Check all 5 keys exist
        var keys = Page.Locator(".key");
        await Expect(keys).ToHaveCountAsync(5);
    }
}
