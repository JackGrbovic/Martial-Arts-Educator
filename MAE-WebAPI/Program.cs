using MAE_WebAPI.Data;
using MAE_WebAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using MAE_WebAPI.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Newtonsoft.Json;
using MAE_WebAPI.Controllers.MAEControllerFunctions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
        {
            options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
        });;
        
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MAEDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<MAEControllerFunctionProvider>();

var allowedOrigins = new[] { "https://martial-arts-educator-client.onrender.com", "http://localhost:3000" };
//var allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "https://martial-arts-educator-client.onrender.com";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// var thing = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]));
// Console.WriteLine(thing);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"].ToString(),
            ValidAudience = builder.Configuration["JwtSettings:Audience"].ToString(),
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"].ToString())),
            ClockSkew = TimeSpan.FromSeconds(30)

        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Cookies["access_token"];
                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;  
                }
                return Task.CompletedTask;
            }
        };
    }
);
builder.Services.AddAuthorization();

IdentityBuilder identityBuilder = builder.Services.AddIdentityCore<ApplicationUser>();
identityBuilder = new IdentityBuilder(identityBuilder.UserType, typeof(IdentityRole), builder.Services);
identityBuilder.AddEntityFrameworkStores<MAEDbContext>();
identityBuilder.AddRoleValidator<RoleValidator<IdentityRole>>();
identityBuilder.AddRoleManager<RoleManager<IdentityRole>>();
identityBuilder.AddSignInManager<SignInManager<ApplicationUser>>();
identityBuilder.AddTokenProvider<DataProtectorTokenProvider<ApplicationUser>>(TokenOptions.DefaultProvider);

builder.Services.AddSingleton<TokenProvider>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();





