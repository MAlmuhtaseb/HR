using HR.DTOs.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HR.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LookupsController : ControllerBase
    {
        private HrDbContext _dbContext;

        public LookupsController(HrDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("GetByMajorCode")]
        public IActionResult GetByMajorCode([FromQuery] int MajorCode)
        {
            try
            {
                var data = from lookup in _dbContext.Lookups
                           where lookup.MajorCode == MajorCode && lookup.MinorCode != 0
                           select new ListDto
                           {
                               Id = lookup.Id,
                               Name = lookup.Name
                           };

                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
