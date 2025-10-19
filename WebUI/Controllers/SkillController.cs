using Application.CQRS.Skill_CQRS;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using WebAPI.CustomFilters;
using WebAPI.ViewModels;
using WebUI.Services;

namespace WebAPI.Controllers;

public class SkillController : ApiControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _openAiKey;
    private readonly string _chatModel;

    public SkillController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;

        //_openAiKey = "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";

        _openAiKey = "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";

        _chatModel = config["OPENAI_CHAT_MODEL"] ?? "gpt-4o-mini";
    }

    [HttpPost("process")]
    [RequestSizeLimit(50_000_000)] // مثال: 50MB - تنظیم کن به نیازت
    public async Task<IActionResult> Process([FromForm] IFormFile audio)
    {
        if (audio == null || audio.Length == 0)
            return BadRequest("هیچ فایل صوتی ارسال نشده.");

        // ذخیره موقت فایل
        var tmpFolder = Path.Combine(Path.GetTempPath(), "uploads");
        Directory.CreateDirectory(tmpFolder);
        var tmpFile = Path.Combine(tmpFolder, $"{Guid.NewGuid()}{Path.GetExtension(audio.FileName)}");
        using (var fs = System.IO.File.Create(tmpFile))
        {
            await audio.CopyToAsync(fs);
        }

        try
        {
            // 1) ارسال فایل به OpenAI Transcriptions (Whisper / Audio API)
            var transcript = await TranscribeWithOpenAiAsync(tmpFile);

            // 2) ارسال متن استخراج‌شده به ChatGPT برای استخراج مهارت‌ها به صورت JSON
            var extractedJson = await ExtractSkillsJsonAsync(transcript);

            // برگردوندن JSON استخراج‌شده به فرانت
            return Ok(new { transcript, result = extractedJson });
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
        finally
        {
            // حذف فایل موقت
            if (System.IO.File.Exists(tmpFile)) System.IO.File.Delete(tmpFile);
        }
    }

    private async Task<string> TranscribeWithOpenAiAsync(string filePath)
    {
        // مستندات: audio/transcriptions endpoint. (Whisper / Audio API). 
        // See: platform.openai.com docs. :contentReference[oaicite:3]{index=3}

        using var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _openAiKey);

        using var multipart = new MultipartFormDataContent();
        using var fs = System.IO.File.OpenRead(filePath);
        var fileContent = new StreamContent(fs);
        // سرور OpenAI معمولاً نوع content-type را خودش تشخیص می‌دهد؛ اما می‌توان header اضافه کرد:
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        multipart.Add(fileContent, "file", Path.GetFileName(filePath));

        // مدل رو مشخص کن (مثلاً whisper-1 یا مدل صوتی دیگری)
        multipart.Add(new StringContent("whisper-1"), "model");
        //multipart.Add(new StringContent("gpt-4o-transcribe"), "model");
        //multipart.Add(new StringContent("gpt-4o-mini-transcribe"), "model");

        var resp = await client.PostAsync("https://api.openai.com/v1/audio/transcriptions", multipart);
        var text = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            throw new Exception($"Transcription API error: {resp.StatusCode} / {text}");

        // پاسخ معمولاً شامل فیلد text است
        using var doc = JsonDocument.Parse(text);
        if (doc.RootElement.TryGetProperty("text", out var txtEl))
            return txtEl.GetString() ?? "";
        else
            throw new Exception("پاسخ transcribe شامل 'text' نبود: " + text);
    }

    private async Task<JsonElement> ExtractSkillsJsonAsync(string transcript)
    {
        // prompt دقیق به مدل می‌گوید که فقط JSON برگردونه با آرایه‌ای از اشیاء { title, value }.
        var prompt = $@"
شما یک استخراج‌کنندهٔ اطلاعات هستید. ورودی: یک ترنسکریپت (متن) که کاربر در آن به صورت گفتاری دربارهٔ مهارت‌ها و مقدار توانایی‌ش صحبت کرده.
کار شما این است که از متن، همهٔ مهارت‌هایی که کاربر ذکر کرده را پیدا کنید و برای هر مهارت یک شیء JSON بسازید با فیلدهای:
- title: عنوان مهارت (مثل 'C#', 'AngularJS', 'SQL', 'طراحی گرافیک' و غیره)
- value: سطح توانایی — سعی کنید آن را به صورت عددی (مثلاً درصد یا عدد از 0 تا 100) استخراج کنید اگر کاربر عدد گفت؛ در غیر این صورت از کلمات استاندارد مانند 'beginner', 'intermediate', 'advanced' یا متن خام گفته‌شده استفاده کنید.

مثال خروجی مورد انتظار (فقط JSON، بدون توضیح اضافی):
[
  {{ ""title"": ""C#"", ""value"": ""90%"" }},
  {{ ""title"": ""AngularJS"", ""value"": ""intermediate"" }}
]

حالا متن زیر را پردازش کن و فقط JSON مشابه مثال بالا برگردان (بدون هیچ توضیح یا متن اضافی):\""{transcript}""";

        using var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _openAiKey);

        var bodyObj = new
        {
            model = _chatModel,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            temperature = 0.0,
            max_tokens = 800
        };

        var bodyJson = JsonSerializer.Serialize(bodyObj);
        using var content = new StringContent(bodyJson, Encoding.UTF8, "application/json");
        var resp = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);
        var respText = await resp.Content.ReadAsStringAsync();

        if (!resp.IsSuccessStatusCode)
            throw new Exception($"Chat API error: {resp.StatusCode} / {respText}");

        using var doc = JsonDocument.Parse(respText);
        // ساختار: choices[0].message.content
        var contentText = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";

        // مدل احتمالاً متن JSON را به صورت رشته بازگردانده — آن را پارس می‌کنیم
        try
        {
            var parsed = JsonDocument.Parse(contentText).RootElement;
            return parsed;
        }
        catch (JsonException)
        {
            // اگر مدل JSON را داخل code block یا با متن اضافی برگرداند، تلاش کنیم تنها بخش JSON را جدا کنیم:
            var jsonOnly = ExtractJsonSubstring(contentText);
            var parsed = JsonDocument.Parse(jsonOnly).RootElement;
            return parsed;
        }
    }

    private string ExtractJsonSubstring(string s)
    {
        // تلاش ساده برای جدا کردن اولین '[' ... ']' که حاوی آرایه JSON است.
        var start = s.IndexOf('[');
        var end = s.LastIndexOf(']');
        if (start >= 0 && end > start)
            return s.Substring(start, end - start + 1);
        throw new JsonException("Couldn't extract JSON substring from model output.");
    }

    [CustomAuthorize("Admin,User")]
    [HttpPost("AddOrUpdate")]
    public async Task<IActionResult> AddOrUpdate(CreateCommand command)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = CurrentUserService.GetUserId(HttpContext);

            var entity = await DbContext.Skills
                .FindAsync(new object[] { command.Id });

            if (entity == null)
            {
                entity = new Skill();
                entity.Title = command.Title;
                entity.Value = command.Value.ToString();
                entity.UserId = userId;

                DbContext.Skills.Add(entity);
            }
            else
            {
                entity.Title = command.Title;
                entity.Value = command.Value.ToString();
            }

            await DbContext.SaveChangesAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [CustomAuthorize("Admin,User")]
    [HttpPost("GetAllByUserId")]
    public async Task<IActionResult> GetAllByUserId(FilterParamsViewModel model)
    {
        try
        {
            var userId = CurrentUserService.GetUserId(HttpContext);

            var query = await DbContext.Skills.AsNoTracking()
                    .Where(m => !m.Deleted)
                    .Where(m => m.UserId == userId)
                    .Select(m => new
                    {
                        m.Id,
                        m.Title,
                        m.CreateDate,
                        Value = Convert.ToInt32(m.Value),
                    })
                    .ToListAsync();

            if (model.Filter != null)
            {
                //foreach (var item in model.Filter)
                //{
                //    if (item.Key == "Title")
                //    {
                //        var val = item.Value[0];
                //        query = query.Where(m => m.Title.Contains(val)).ToList();
                //    }
                //    else if (item.Key == "Number")
                //    {
                //        var val = item.Value[0];
                //        query = query.Where(m => m.Number == val).ToList();
                //    }
                //    else if (item.Key == "UserFullName")
                //    {
                //        var val = item.Value[0];
                //        query = query.Where(m => m.UserFullName == val).ToList();
                //    }
                //}
            }
            if (model.Sorting != null && model.Sorting.Count > 0)
                query = query.AsQueryable().OrderBy(model.Sorting.ElementAt(0).Key + (model.Sorting.ElementAt(0).Value == "desc" ? " descending" : "")).ToList();
            else
                query = query.OrderByDescending(m => m.CreateDate).ToList();

            var result = query.Skip((model.PageCount - 1) * model.PageSize).Take(model.PageSize);
            int count = query.Count();
            return Ok(new { items = result, count });
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [CustomAuthorize("Admin,User")]
    [HttpGet("Delete/{Id}")]
    public async Task<IActionResult> Delete(Guid Id)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = await DbContext.Skills.FindAsync(new object[] { Id });

            if (entity == null)
            {
                throw new Exception("Not Found");
            }

            entity.Deleted = true;
            await DbContext.SaveChangesAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }
}
