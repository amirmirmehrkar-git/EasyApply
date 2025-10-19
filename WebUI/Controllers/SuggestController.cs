using Application.CQRS.Suggest_CQRS;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using WebAPI.CustomFilters;
using WebAPI.ViewModels;
using WebUI.Services;

namespace WebAPI.Controllers;

public class SuggestController : ApiControllerBase
{
    [CustomAuthorize("Admin,User")]
    [HttpPost("AddResponse")]
    public async Task<IActionResult> AddResponse(CreateResponseCommand command)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = CurrentUserService.GetUserId(HttpContext);

            var entity = new ResponseSuggest();
            entity.ResponseText = command.ResponseText;
            entity.SuggestId = command.SuggestId;

            DbContext.ResponseSuggests.Add(entity);

            await DbContext.SaveChangesAsync();

            return Ok();
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }

    [CustomAuthorize("Admin,User")]
    [HttpGet("GetAllSuggestByUserId")]
    public async Task<IActionResult> GetAllSuggestByUserId()
    {
        try
        {
            var userId = CurrentUserService.GetUserId(HttpContext);

            var query = await DbContext.Suggests.AsNoTracking()
                .Where(m => !m.Deleted)
                .Where(m => m.Cv.UserId == userId)
                .Select(m => new
                {
                    m.Id,
                    m.Title,
                    m.Company,
                    m.About,
                    m.Description,

                    Responses = (m.Responses == null || m.Responses.Count() == 0) ? null
                    : m.Responses.Select(r => new
                    {
                        r.ResponseText,
                        r.AiResult,
                        CreateDate = r.CreateDate.Value.ToLongDateString(),
                    }).ToList(),

                    CreateDate = m.CreateDate.Value.ToShortDateString(),
                })
                .ToListAsync();

            return Ok(query);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }
    }
}
