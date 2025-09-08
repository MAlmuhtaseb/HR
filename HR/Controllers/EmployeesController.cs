using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HR.Model;
using HR.DTOs.Employees;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using HR.DTOs.Shared;
using HR.Enums;

namespace HR.Controllers
{
    [Authorize] // Authentication / Authorization
    [Route("api/Employees")]// --> Data Annotation
    [ApiController]// --> Data Annotation
    public class EmployeesController : ControllerBase
    {
        private HrDbContext _dbContext;
        private IWebHostEnvironment _env;
        private IConfiguration _config;

        public EmployeesController(HrDbContext dbContext, IWebHostEnvironment env, IConfiguration config) // Constructor
        {

            _dbContext = dbContext;
            _env = env;
            _config = config;
        }

        //[Authorize(Roles = "HR,Admin")]
        [HttpGet("GetAll")]// --> Data Annotation
        public IActionResult GetAll([FromQuery] FilterEmployeeDto filterDto) // Postion Is Optional // Query Parameter
        {
            try
            {
            var data = from employee in _dbContext.Employees
                       from department in _dbContext.Departments.Where(x => x.Id == employee.DepartmentId).DefaultIfEmpty() // Left Join
                       from manager in _dbContext.Employees.Where(x => x.Id == employee.ManagerId).DefaultIfEmpty() // Left Join
                       from lookup in _dbContext.Lookups.Where(x => x.Id == employee.PositionId).DefaultIfEmpty() // Left Join
                       where 
                             (filterDto.PositionId == null || employee.PositionId == filterDto.PositionId) && // employee.Position == postion // Filtarion Optional
                             (filterDto.EmployeeName == null || employee.Name.ToUpper().Contains(filterDto.EmployeeName.ToUpper())) &&
                             (filterDto.IsActive == null || employee.IsActive == filterDto.IsActive)

                       orderby employee.Id descending
                            select new EmployeeDto 
                            {
                                Id = employee.Id,
                                Name = employee.Name,
                                PositionId = employee.PositionId,
                                PositionName = lookup.Name,
                                BirthDate = employee.BirthDate,
                                IsActive = employee.IsActive,
                                StartDate = employee.StartDate,
                                Phone = employee.Phone,
                                ManagerId = employee.ManagerId,
                                ManagerName = manager.Name,
                                DepartmentId = employee.DepartmentId,
                                DepartmentName = department.Name,
                                ImagePath = employee.ImagePath != null ? Path.Combine(_config["BaseUrl"], employee.ImagePath) : ""
                            };
            return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpGet("GetById")]
        public IActionResult GetById([FromQuery] long Id) // 1
        {
          

            try
            {
            var employee = _dbContext.Employees.Select(employee => new EmployeeDto
            {
                Id = employee.Id,
                Name = employee.Name,
                PositionId = employee.PositionId,
                PositionName = employee.Lookup.Name,
                BirthDate = employee.BirthDate,
                IsActive = employee.IsActive,
                StartDate = employee.StartDate,
                Phone = employee.Phone,
                ManagerId = employee.ManagerId,
                DepartmentId = employee.DepartmentId,
                DepartmentName = employee.DepartmentRow.Name,
                ManagerName = employee.Manager.Name
            }).FirstOrDefault(x => x.Id == Id);

            return Ok(employee);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        [HttpPost("Add")]
        public IActionResult Add([FromForm] SaveEmployeeDto employeeDto )
        {

            try
            {
                var user = new User()
                {
                    Id = 0,
                    UserName = $"{employeeDto.Name}_HR",//Ahmad --> Ahmad_HR
                    HashedPassword = BCrypt.Net.BCrypt.HashPassword($"{employeeDto.Name}@123"), // Ahmad --> Ahmad@123
                    IsAdmin = false
                };

                var _user = _dbContext.Users.FirstOrDefault(x => x.UserName.ToUpper() == user.UserName.ToUpper());
                if(_user != null)
                {
                    return BadRequest("Cannot Add this Employee : The Username Already Exist. Please Select another name");
                }

                _dbContext.Users.Add(user);

                var employee = new Employee()
                {
                    Id = 0, // Ignored
                    Name = employeeDto.Name,
                    BirthDate = employeeDto.BirthDate,
                    Phone = employeeDto.Phone,
                    PositionId = employeeDto.PositionId,
                    IsActive = employeeDto.IsActive,
                    StartDate = employeeDto.StartDate,
                    EndDate = employeeDto.EndDate,
                    DepartmentId = employeeDto.DepartmentId,
                    ManagerId = employeeDto.ManagerId,
                    User = user,
                    ImagePath = null
                };

                if (employeeDto.Image != null)
                {
                    employee.ImagePath = UploadImage(employeeDto.Image);
                }

                _dbContext.Employees.Add(employee);
                _dbContext.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
  
        }

        [HttpPut("Update")]
        public IActionResult Update([FromForm] SaveEmployeeDto employeeDto)
        {


            try
            {
                var employee = _dbContext.Employees.FirstOrDefault(x => x.Id == employeeDto.Id); // Employee to be updated

                if (employee == null)
                {
                    return BadRequest("Employee Not Found"); //400 
                }

                employee.Name = employeeDto.Name;
                employee.BirthDate = employeeDto.BirthDate;
                employee.PositionId = employeeDto.PositionId;
                employee.IsActive = employeeDto.IsActive;
                employee.Phone = employeeDto.Phone;
                employee.StartDate = employeeDto.StartDate;
                employee.EndDate = employeeDto.EndDate;
                employee.DepartmentId = employeeDto.DepartmentId;
                employee.ManagerId = employeeDto.ManagerId;

                if(employeeDto.Image != null)
                {
                    employee.ImagePath = UploadImage(employeeDto.Image);
                }
                else if(employeeDto.Image == null  && employeeDto.IsImage == false)
                {
                    employee.ImagePath = null;
                }




                    _dbContext.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("Delete")]
        public IActionResult Delete([FromQuery] long id)
        {
            
            try
            {
                var employee = _dbContext.Employees.FirstOrDefault(x => x.Id == id); // Employee to be deleted
                if (employee == null)
                {
                    return BadRequest("Employee Not Found"); //400 
                }

                var employeeAssociate = _dbContext.Employees.FirstOrDefault(x => x.ManagerId == id); // Employee Is Manager
                if(employeeAssociate != null)
                {
                    return BadRequest("Managers with assigned employees cannot be deleted.");
                }

                _dbContext.Employees.Remove(employee);
                _dbContext.SaveChanges();
                return Ok();

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetManagersList")]
        public IActionResult GetManagersList([FromQuery] long? employeeId)
        {
            var data = from emp in _dbContext.Employees
                       from pos in _dbContext.Lookups.Where(x => x.Id == emp.PositionId)
                       where emp.IsActive &&
                             emp.Id != employeeId &&  
                             pos.MajorCode == (int)LookupMajorCodes.EmployeePositions &&
                             pos.MinorCode == (int)PositionsMinorCodes.Manager 
                       select new ListDto
                       {
                           Id = emp.Id,
                           Name = emp.Name
                       };

            return Ok(data);

        }


        private string UploadImage(IFormFile Image)
        {
           // folderPath = "D:\\Attachments\\EmployeeImages";
            var imagesFolderPath = Path.Combine("Atttachments", "EmployeeImages");

            var folderPath = Path.Combine(_env.WebRootPath, imagesFolderPath);
            //"D:\\HR\\HR\\wwwroot"

            if (!Directory.Exists(folderPath))
            {
                //Create Folder
                Directory.CreateDirectory(folderPath);
            }

            var fileExtnesion = Path.GetExtension(Image.FileName); // .png, .jpg, .jpeg .....
            var fileName = Guid.NewGuid() + fileExtnesion; // 23f45e89-8b5a-5c55-9df7-240d78a3ce15 + .png

            var filePath = Path.Combine(folderPath, fileName);
            // D:\\HR\\HR\\wwwroot\\Attachments\\EmployeeImages\\23f45e89-8b5a-5c55-9df7-240d78a3ce15.png



            using (var stream = new FileStream(filePath, FileMode.Create))// Auto Dispose Connection
            {
                Image.CopyTo(stream);// Copy Image To File Stream
            }

            return Path.Combine(imagesFolderPath, fileName);

        }
    }
}




// Simple Data Type : long, int, string.... | Query Parameter (By Default)
// Complex Data Type : Model, Dto (object) | Request Body (By Default)

// Http Get : Can Not Use Body Request [FromBody], We Can Only Use Query Parameter [FromQuery]
// Http Put/Post : Can Use Both Body Request [FromBody] And Query Parameter [FromQuery], But We Will Only Use [FromBody]
// Http Delete : Can Use Both Body Request [FromBody] And Query Parameter [FromQuery], But We Will Only Use [FromQuery]

//Can't Use Multiple Paramters Of Type [FromBody]
//Can Use Multiple Parameters Of Type [FromQuery]

