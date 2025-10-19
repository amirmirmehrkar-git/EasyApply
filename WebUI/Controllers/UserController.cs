using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Linq.Dynamic.Core;
using WebAPI.CustomFilters;
using WebAPI.Extensions;
using WebAPI.Helper;
using WebAPI.ViewModels;
using WebUI.Services;

namespace WebAPI.Controllers
{
    public class UserController : ApiControllerBase
    {
        protected readonly Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> userManager;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public UserController(Microsoft.AspNetCore.Identity.UserManager<ApplicationUser> UserManager,
            IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
            userManager = UserManager;
        }

        private async Task<string> CreateUser(AddOrUpdateUserViewModel model, UserType userType, List<string> roles = null)
        {
            var query = await userManager.FindByPhoneAsync(model.PhoneNumber);
            if (query == null)
            {
                var senfId = Guid.Empty;

                var employe = new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    PhoneNumber = model.PhoneNumber,
                    UserName = model.PhoneNumber,
                    Email = Guid.NewGuid().ToString().Substring(0, 5) + "@yahoo.com",
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    EmailConfirmed = true,
                    Deleted = false,
                    UserType = userType,
                    Active = model.Active,
                    CreateDate = DateTime.Now,
                };
                var res1 = await userManager.CreateAsync(employe, model.Password);
                if (res1.Errors.Any(m => m.Code.ToLower().Contains("tooshort")))
                {
                    throw new Exception("تعداد کاراکتر های رمز باید از 8 عدد بیشتر باشد");
                }
                if (res1.Errors.Any(m => m.Code.ToLower().Contains("duplicate")))
                {
                    throw new Exception("شماره تماس تکراری است");
                }

                if (userType == UserType.User)
                {
                    await userManager.AddToRolesAsync(employe, new[] { "User" });
                }
                else if (userType == UserType.Admin)
                {
                    await userManager.AddToRolesAsync(employe, roles);
                }

                return employe.Id;
            }
            else
            {
                query.PhoneNumber = model.PhoneNumber;
                query.UserName = model.PhoneNumber;
                query.FirstName = model.FirstName;
                query.LastName = model.LastName;
                query.Active = model.Active;

                var res = await userManager.UpdateAsync(query);

                string resetToken = await userManager.GeneratePasswordResetTokenAsync(query);
                var res1 = await userManager.ResetPasswordAsync(query, resetToken, model.Password);
                if (res1.Errors.Any(m => m.Code.ToLower().Contains("tooshort")))
                {
                    throw new Exception("تعداد کاراکتر های رمز باید از 8 عدد بیشتر باشد");
                }
                if (res1.Errors.Any(m => m.Code.ToLower().Contains("duplicate")))
                {
                    throw new Exception("شماره تماس تکراری است");
                }
                return query.Id;
            }
        }

        [CustomAuthorize("Admin,READ_USERS")]
        [HttpPost("AddOrUpdateUser")]
        public async Task<IActionResult> AddOrUpdateUser(AddOrUpdateUserViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = await CreateUser(model, UserType.User);


                return Ok();
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("Messages", ex.Message);
                return BadRequest(ModelState);
            }
        }

        [CustomAuthorize("Admin,READ_USERS")]
        [HttpPost("AddOrUpdateAdmin")]
        public async Task<IActionResult> AddOrUpdateAdmin(AddOrUpdateUserViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = await CreateUser(model, UserType.Admin);

                return Ok();
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("Messages", ex.Message);
                return BadRequest(ModelState);
            }
        }


        [CustomAuthorize("Admin,User")]
        [HttpPost("UpdateProfile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = CurrentUserService.GetUserId(HttpContext);
                var query = await userManager.FindByIdAsync(userId);
                query.FirstName = model.FirstName;
                query.LastName = model.LastName;
                query.NeededJob = model.NeededJob;
                await userManager.UpdateAsync(query);

                return Ok();
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [CustomAuthorize("Admin,User,READ_USERS")]
        [HttpGet("Delete/{Id}")]
        public async Task<ActionResult> Delete(string Id)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var entity = await DbContext.Users
                    .FindAsync(new object[] { Id });

                if (entity == null)
                {
                    throw new Exception("موردی یافت نشد");
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


        [CustomAuthorize("Admin,READ_USERS")]
        [HttpPost("GetAllUsers")]
        public async Task<IActionResult> GetAllUsers(FilterParamsViewModel model)
        {
            try
            {
                var query = await DbContext.Users.AsNoTracking()
                    .Where(m => !m.Deleted)
                    .Where(m => m.UserType == UserType.User)
                    .Select(m => new
                    {
                        m.Id,
                        m.PhoneNumber,
                        FullName = m.FirstName + " " + m.LastName,
                        m.FirstName,
                        m.LastName,
                        m.FatherName,
                        m.Active,
                        CreateDate = m.CreateDate.Value.ToShortDateString(),
                    })
                    .ToListAsync();

                if (model.Filter != null)
                {
                    foreach (var item in model.Filter)
                    {
                        if (item.Key == "FullName")
                        {
                            var val = item.Value[0];
                            query = query.Where(m => m.FullName.Contains(val)).ToList();
                        }
                        if (item.Key == "PhoneNumber")
                        {
                            var val = item.Value[0];
                            query = query.Where(m => m.PhoneNumber.Contains(val)).ToList();
                        }
                        //if (item.Key == "CreateDate")
                        //{
                        //    var val = item.Value[0];
                        //    try
                        //    {
                        //        DateTime date = PersianDateTime.Parse(val).ToDateTime().Date;
                        //        query = query.Where(m => m.CreateDate.Year == date.Year
                        //                              && m.CreateDate.Month == date.Month
                        //                              && m.CreateDate.Day == date.Day).ToList();
                        //    }
                        //    catch { }
                        //}
                    }
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

        [HttpGet("CheckApi")]
        public async Task<IActionResult> CheckApi()
        {
            try
            {
                var query = await DbContext.Users.AsNoTracking()
                    .Where(m => !m.Deleted)
                    .ToListAsync();

                return Ok(query);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

    }
}
