using HR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        //[67, 58, 69]
        var key = Encoding.UTF8.GetBytes("WHAFWEI#!@S!!112312WQEQW@RWQEQW432"); // Define the secret key
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // The Source Where The Token Is Issued
            ValidateAudience = false, // The Users Whome Can Use This Token
            ValidateIssuerSigningKey = true, // Make Sure That The Token Is Using My Secret Key
            IssuerSigningKey = new SymmetricSecurityKey(key), // Generate The Token Using Our Key
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        //builder.WithOrigins("https://localhost:4200")
        builder.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});


builder.Services.AddDbContext<HrDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("HrContext"))
);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseStaticFiles(); // Allow To Serve Files

app.MapControllers();

app.Run();
