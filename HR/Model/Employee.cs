using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HR.Model
{
    public class Employee // Model
    {
        public long Id { get; set; }
        [MaxLength(50)]
        public string Name { get; set; }
        public DateTime? BirthDate { get; set; } // Nullable // Optional
        [MaxLength(50)]
        public string? Phone { get; set; }
        public bool IsActive { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }


        [ForeignKey("DepartmentRow")]
        public long? DepartmentId { get; set; }
        public Department? DepartmentRow { get; set; } // Navigation Proprtey

        [ForeignKey("Manager")]
        public long? ManagerId { get; set;}
        public Employee? Manager { get; set; }// Navigation Proprtey

        [ForeignKey("Lookup")]
        public long? PositionId { get; set; }
        public Lookup? Lookup { get; set; }// Navigation Proprtey

        [ForeignKey("User")]
        public long? UserId { get; set; }
        public User? User { get; set; } // Navigation Proprtey
        public string? ImagePath { get; set; }
    }
}
