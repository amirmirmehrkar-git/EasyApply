using FastReport;
using FastReport.Export.PdfSimple;
using MediatR;
using Microsoft.AspNetCore.Mvc;
namespace WebAPI.Controllers
{
    public class FileController : Controller
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        public FileController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpPost("File/UploadDocument")]
        public async Task<ContentResult> UploadSignatureFile()
        {
            return await BaseUpload("Documents\\");
        }

        [HttpPost("File/UploadTicketFile")]
        public async Task<ContentResult> UploadTicketFile()
        {
            return await BaseUpload("TicketFiles\\");
        }

        private async Task<ContentResult> BaseUpload(string FolderName)
        {
            var fileName = Guid.NewGuid().ToString();
            var file = Request.Form.Files[0];
            var extension = GetDefaultExtension(file.ContentType.ToLower());
            var path = _hostingEnvironment.WebRootPath + "\\Content\\" + FolderName + fileName + extension;

            if (!Directory.Exists(_hostingEnvironment.WebRootPath + "\\Content\\" + FolderName))
            {
                Directory.CreateDirectory(path);
            }

            using (var stream = new FileStream(path, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Content(fileName + extension);
        }

        public static string GetDefaultExtension(string mimeType)
        {
            string result = "";
            if (mimeType.Contains("pdf"))
            {
                result = ".pdf";
            }
            else if (mimeType.Contains("jpeg"))
            {
                result = ".jpg";
            }
            else if (mimeType.Contains("png"))
            {
                result = ".png";
            }
            else if (mimeType.Contains("zip"))
            {
                result = ".zip";
            }
            else if (mimeType.Contains("mp4"))
            {
                result = ".mp4";
            }
            else if (mimeType.Contains("mp3") || mimeType.Contains("mpeg"))
            {
                result = ".mp3";
            }
            else if (mimeType.Contains("msdownload"))
            {
                result = ".exe";
            }
            else if (mimeType.Contains("sheet"))
            {
                result = ".xlsx";
            }
            else if (mimeType.Contains("json"))
            {
                result = ".json";
            }
            return result;
        }
    }
}
