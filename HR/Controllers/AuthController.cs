using HR.DTOs.Auth;
using HR.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HR.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private HrDbContext _dbContext;

        public AuthController(HrDbContext dbContext) // Constructor
        {
            _dbContext = dbContext;
        }

        [HttpPost("Login")]
        public IActionResult Login(LoginDto loginDto)
        {
            try
            {
                // admin, Admin, ADMIN  == Admin // ADMIN == ADMIN
                var user = _dbContext.Users.FirstOrDefault(x => x.UserName.ToUpper() == loginDto.UserName.ToUpper());

                if (user == null)
                {
                    return BadRequest("Invalid UserName Or Password");
                }
                // $2a$11$pkpybQvqeC0S6e1dTqUrwO/jB0AbZC0fKcUrmYJS/1nmW4a2UC7YW  == Admin@123
                // True  --> Matching Passwords
                // !True --> False
                // False --> Not Matching Passwords
                // !False --> True
                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.HashedPassword))
                {
                    return BadRequest("Invalid UserName Or Password");
                }

                var token = GenerateJwtToken(user);

                return Ok(token);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            
        }

        private TokenDto GenerateJwtToken(User user)
        {
            string role;
            var claims = new List<Claim>(); // User Info 

            //Key --> Value
            claims.Add(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));
            claims.Add(new Claim(ClaimTypes.Name, user.UserName));

            // HR , Manager, Developer, Admin  --> Roles
            if (user.IsAdmin)
            {
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));
                role = "Admin";
            }
            else
            {
                var employee = _dbContext.Employees.Include(x => x.Lookup).FirstOrDefault(x => x.UserId == user.Id);
                claims.Add(new Claim(ClaimTypes.Role, employee.Lookup.Name));

                role = employee.Lookup.Name;
            }


            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("WHAFWEI#!@S!!112312WQEQW@RWQEQW432"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenSettings = new JwtSecurityToken(
                    claims: claims, // User Info
                    expires: DateTime.Now.AddDays(1), // When Does The Token Expire
                    signingCredentials: creds  // Encryption Settings
                );

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.WriteToken(tokenSettings);

            return new TokenDto { Token = token, Role = role};

        }

    }

}


/*
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWRtaW4iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImV4cCI6MTc1MzAwMzMxNH0.P4jLxq9KDkB1PwBSj22RYY21vyZU5ohGGZwr5dD91Io
 */