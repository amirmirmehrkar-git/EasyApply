using DevExpress.Xpo;
using Domain.Common;
using Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class Suggest : BaseEntity
    {
        public string? Title { get; set; }
        public string? Company { get; set; }
        public string? About { get; set; }
        public string? Description { get; set; }

        public Guid? CvId { get; set; }
        [ForeignKey("CvId"), Nullable(true)]
        public virtual Cv? Cv { get; set; }

        public virtual ICollection<ResponseSuggest>? Responses { get; set; }
    }
}