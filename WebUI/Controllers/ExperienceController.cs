using Application.CQRS.Experience_CQRS;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;
using WebAPI.CustomFilters;
using WebAPI.ViewModels;
using WebUI.Services;

namespace WebAPI.Controllers;

public class ExperienceController : ApiControllerBase
{
    [CustomAuthorize("Admin,User")]
    [HttpPost("AddOrUpdate")]
    public async Task<IActionResult> AddOrUpdate(CreateCommand command)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = CurrentUserService.GetUserId(HttpContext);

            var entity = await DbContext.Experiences
                .FindAsync(new object[] { command.Id });

            if (entity == null)
            {
                entity = new Experience();
                entity.Project = command.Project;
                entity.Company = command.Company;
                entity.Role = command.Role;
                entity.Activity = command.Activity;
                entity.Benefit = command.Benefit;
                entity.UserId = userId;

                DbContext.Experiences.Add(entity);
            }
            else
            {
                entity.Project = command.Project;
                entity.Company = command.Company;
                entity.Role = command.Role;
                entity.Activity = command.Activity;
                entity.Benefit = command.Benefit;
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

            var query = await DbContext.Experiences.AsNoTracking()
                    .Where(m => !m.Deleted)
                    .Where(m => m.UserId == userId)
                    .Select(m => new
                    {
                        m.Id,
                        m.Project,
                        m.Company,
                        m.Role,
                        m.Activity,
                        m.Benefit,
                        m.CreateDate,
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

            var entity = await DbContext.Experiences.FindAsync(new object[] { Id });

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
