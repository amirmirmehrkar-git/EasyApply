namespace WebAPI.ViewModels
{
    public class AddOrUpdateUserViewModel
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Password { get; set; }
        public string? Shba { get; set; }
        public string? BankAccount { get; set; }
        public string? CardNumber { get; set; }
        public Guid? PermissionId { get; set; }
        public bool Active { get; set; }
    }
}
