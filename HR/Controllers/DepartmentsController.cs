using HR.DTOs.Departments;
using HR.DTOs.Shared;
using HR.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace HR.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private HrDbContext _dbContext;

        public DepartmentsController(HrDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("GetAll")]
        public IActionResult GetAll([FromQuery] FilterDepartmentsDto filterDto)
        {
            try
            {
            var data = from department in _dbContext.Departments
                       from lookup in _dbContext.Lookups.Where(x => x.Id == department.TypeId).DefaultIfEmpty()
                       where (filterDto.DepartmentName == null || department.Name.ToUpper().Contains(filterDto.DepartmentName.ToUpper())) &&
                       (filterDto.FloorNumber == null || department.FloorNumber == filterDto.FloorNumber )
                       select new DepartmentDto
                       {
                           Id = department.Id,
                           Name = department.Name,
                           Description = department.Description,
                           FloorNumber = department.FloorNumber,
                           TypeId = lookup.Id,
                           TypeName = lookup.Name
                       };


                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpGet("GetById")]
        public IActionResult GetById([FromQuery] long Id) // 2
        {
            try
            {
            var department = _dbContext.Departments.Select(x => new DepartmentDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                FloorNumber = x.FloorNumber,
                TypeId = x.Lookup.Id,
                TypeName = x.Lookup.Name
            }).FirstOrDefault(x => x.Id == Id);

            return Ok(department);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPost("Add")]
        public IActionResult Add([FromBody] SaveDeaprtmentDto departmentDto)
        {
            try
            {
            var department = new Department
            {
                Id = 0,
                Name = departmentDto.Name,
                Description = departmentDto.Description,
                FloorNumber = departmentDto.FloorNumber,
                TypeId = departmentDto.TypeId
            };

            _dbContext.Departments.Add(department);
            _dbContext.SaveChanges();
            return Ok(); // 200
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPut("Update")]
        public IActionResult Update([FromBody] SaveDeaprtmentDto departmentDto)
        {

            try
            {
                var department = _dbContext.Departments.FirstOrDefault(x => x.Id == departmentDto.Id);

                if (department == null)
                {
                    return BadRequest("Department Does Not Exist");
                }

                department.Name = departmentDto.Name;
                department.Description = departmentDto.Description;
                department.FloorNumber = departmentDto.FloorNumber;
                department.TypeId = departmentDto.TypeId;
                _dbContext.SaveChanges();
                return Ok(); // 200
            }
            catch(Exception ex){// Generaic Exception
                return BadRequest(ex.Message);
            }
    
        }

        [HttpDelete("Delete")]
        public IActionResult Delete([FromQuery] long Id)
        {
            try
            {
            var department = _dbContext.Departments.FirstOrDefault(x => x.Id == Id);

            if (department == null)
            {
                return BadRequest("Department Does Not Exist");
            }

            _dbContext.Departments.Remove(department);
            _dbContext.SaveChanges();
            return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpGet("GetDepartmentsList")]
        public IActionResult GetDepartmentsList()
        {
            try
            {
                var departments = _dbContext.Departments.Select(x => new ListDto
                {
                    Id = x.Id,
                    Name = x.Name
                });

                return Ok(departments);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



    }
}
