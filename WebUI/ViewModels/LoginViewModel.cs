using System.ComponentModel.DataAnnotations;

namespace WebAPI.ViewModels
{
    public class LoginViewModel
    {
        public string Phone { get; set; }
        public string Password { get; set; }
    }
}
