using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Controllers;
using WebAPI.Extensions;
using WebAPI.ViewModels;
using WebUI.Services;

namespace WebUI.Controllers
{
    public class AccountController : ApiControllerBase
    {
        protected readonly IJwtService jwtService;
        protected readonly SignInManager<ApplicationUser> signInManager;
        protected readonly UserManager<ApplicationUser> userManager;

        public AccountController(
               IJwtService JwtService
             , SignInManager<ApplicationUser> SignInManager
            , UserManager<ApplicationUser> UserManager)
        {
            signInManager = SignInManager;
            userManager = UserManager;
            jwtService = JwtService;
        }

        [Route("Login")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var user = await userManager.FindByPhoneAsync(model.Phone);
            if (user == null)
            {
                return NotFound();
            }

            var status = await signInManager.PasswordSignInAsync(user.UserName, model.Password, true, false);
            if (status.Succeeded)
            {
                await signInManager.SignOutAsync();
                await signInManager.SignInAsync(user, true);


                var userId = jwtService.GenerateJwtToken(string.Join(",", user.Id));
                Response.Cookies.Append("TokenId", userId);

                var roles = userManager.GetRolesAsync(user).Result;
                var token = jwtService.GenerateJwtToken(string.Join(",", roles));
                Response.Cookies.Append("Token", token);

                return Ok(new
                {
                    success = true,
                    role = roles.Any(m => m.Contains("READ")) ? "Admin" : roles.FirstOrDefault(),
                    TokenId = userId,
                    Token = token
                });
            }
            else
            {
                ModelState.AddModelError("Messages", "The username or password is incorrect.");
                return BadRequest(ModelState);
            }
        }

        [AllowAnonymous]
        [Route("SignUp")]
        [HttpPost]
        public async Task<IActionResult> SignUp(AddOrUpdateUserViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var query = await userManager.FindByPhoneAsync(model.PhoneNumber);
                if (query == null)
                {
                    var user = new ApplicationUser
                    {
                        Id = Guid.NewGuid().ToString(),
                        PhoneNumber = model.PhoneNumber,
                        UserName = model.PhoneNumber,
                        Email = model.PhoneNumber,
                        FirstName = model.FirstName,
                        LastName = model.LastName,
                        SecurityStamp = Guid.NewGuid().ToString(),
                        EmailConfirmed = true,
                        Deleted = false,
                        UserType = Domain.Enums.UserType.User,
                        CreateDate = DateTime.Now
                    };
                    await userManager.CreateAsync(user, model.Password);

                    await userManager.AddToRolesAsync(user, new[] { "User" });

                }
                else
                {
                    query.FirstName = model.FirstName;
                    query.LastName = model.LastName;
                    await userManager.UpdateAsync(query);
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpGet("loginWithToken/{Id}")]
        [AllowAnonymous]
        public async Task<IActionResult> loginWithToken(string Id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var user = await userManager.FindByIdAsync(Id);
            if (user == null)
            {
                return NotFound();
            }

            await signInManager.SignOutAsync();
            await signInManager.SignInAsync(user, true);

            var userId = jwtService.GenerateJwtToken(string.Join(",", user.Id));
            Response.Cookies.Append("TokenId", userId);

            var roles = userManager.GetRolesAsync(user).Result;
            var token = jwtService.GenerateJwtToken(string.Join(",", roles));
            Response.Cookies.Append("Token", token);

            return Ok(new
            {
                success = true,
                role = roles.Any(m => m.Contains("READ")) ? "Admin" : roles.FirstOrDefault(),
                TokenId = userId,
                Token = token
            });
        }

        [HttpGet("ChangePassword/{OldPassword}/{NewPassword}")]
        [AllowAnonymous]
        public async Task<IActionResult> ChangePassword(string OldPassword, string NewPassword)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var userId = CurrentUserService.GetUserId(HttpContext);
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }
            var s = await userManager.ChangePasswordAsync(user, OldPassword, NewPassword);
            if (s.Succeeded)
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        //[CustomAuthorize("Admin,User")]
        [HttpGet("GetProfile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = CurrentUserService.GetUserId(HttpContext);

                var query = await DbContext.Users.AsNoTracking()
                  .Where(m => !m.Deleted)
                  .Where(m => m.Id == userId)
                  .Select(m => new
                  {
                      m.Id,
                      m.PhoneNumber,
                      FullName = m.FirstName + " " + m.LastName,
                      m.FirstName,
                      m.LastName,
                      m.NationalCode,
                      m.FatherName,
                      m.Address,
                      m.NeededJob,
                      m.CreateDate,
                      m.ImageName,
                      m.Active,
                  })
                  .SingleOrDefaultAsync();
                return Ok(query);
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpGet]
        public ActionResult LogOff()
        {
            return RedirectToAction("Index", "Home");
        }
    }
}