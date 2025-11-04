using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using MAE_WebAPI.Models;
using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Http.HttpResults;
using MAE_WebAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using System.ComponentModel.DataAnnotations;
using MAE_WebAPI.Auth;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using MAE_WebAPI.Controllers.MAEControllerFunctions;
using System.Security.Cryptography;
using Microsoft.VisualBasic;
using Microsoft.AspNetCore.JsonPatch.Internal;

namespace MAE_WebAPI.Controllers{
    [Route("api/[controller]")]
    [ApiController]
    public class MAEController : ControllerBase
    {
        private readonly MAEDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly TokenProvider _tokenProvider;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly MAEControllerFunctionProvider _mAEControllerFunctionProvider;

        public MAEController(MAEDbContext context, UserManager<ApplicationUser> userManager, TokenProvider tokenProvider, SignInManager<ApplicationUser> signInManager, MAEControllerFunctionProvider mAEControllerFunctionProvider)
        {
            _context = context;
            _userManager = userManager;
            _tokenProvider = tokenProvider;
            _signInManager = signInManager;
            _mAEControllerFunctionProvider = mAEControllerFunctionProvider;
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterFormRequest model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { error = "A user with this email already exists." });
                }

                var id = Guid.NewGuid();

                var user = new ApplicationUser
                {
                    UserName = model.Email,
                    Id = id.ToString(),
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Email = model.Email
                };

                var result = await _userManager.CreateAsync(user, model.Password);

                if (!result.Succeeded)
                {
                    Console.WriteLine("Result failed");
                    Console.WriteLine(result.Errors);
                    return BadRequest(ModelState);
                }
                Console.WriteLine("Result succeeded");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR: " + ex.Message);
                return StatusCode(500, new { error = ex.Message });
            }
        }

        //declare reviews method elsewhere and call it in here after validating user
        [Authorize]
        [HttpGet("get-app-data")]
        public async Task<IActionResult> GetAppData()
        {
            try
            {
                var steps = await _context.Steps.ToListAsync();
                var martialArts = await _context.MartialArts
                .Include(ma => ma.Moves)
                .ThenInclude(m => m.Steps)
                .ThenInclude(m => m.StepOptions)
                .ToListAsync();

                foreach (var ma in martialArts)
                {
                    ma.Moves = ma.Moves.OrderBy(m => m.LearningOrderNumber).ToList();
                    foreach (var move in ma.Moves)
                    {
                        move.Steps = move.Steps.OrderBy(s => s.StepNumber).ToList();
                    }
                }

                if (martialArts == null) return NotFound("Data not found.");
                var returnObject = new { steps, martialArts };



                return Ok(returnObject);
            }
            catch (Exception ex)
            {
                Console.WriteLine("problem" + ex.Message);
            }

            return BadRequest(ModelState);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(IConfiguration configuration)
        {
            var token = Request.Cookies["access_token"];
            if (string.IsNullOrEmpty(token))
                return Unauthorized("No token found.");

            var tokenHandler = new JwtSecurityTokenHandler();

            //the below may be redundant, if not, we've at the least duplicated code from program.cs
            var principal = tokenHandler.ValidateToken(
                token,
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtSettings:Key"])),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = configuration["JwtSettings:Issuer"],
                    ValidAudience = configuration["JwtSettings:Audience"],
                    // Ignore expiry so we can inspect claims
                    ValidateLifetime = false
                },
                out var validatedToken
            );

            var tokenIp = principal.FindFirst("ip")?.Value;
            var requestIp = HttpContext.Connection.RemoteIpAddress?.ToString();

            if (tokenIp != requestIp)
            {
                return Unauthorized("IP mismatch");
            }

            var newAccessToken = _tokenProvider.CreateAccessToken(principal, tokenIp);

            //maybe using ClaimTypes.NameIdentifier is causing issues
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized("Missing subject claim.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized("User not found.");
            }

            //maybe only do this if token is expired
            HttpContext.Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
            });

            Console.WriteLine("User");
            Console.WriteLine(user);

            var learnedMovesResponse = await _context.LearnedMoves.Where(lm => lm.UserId == user.Id).ToListAsync();
            List<LearnedMove> learnedMoves = new();
            learnedMoves.AddRange(learnedMovesResponse);

            return Ok(new
            {
                user = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    LearnedMoves = learnedMoves,
                    Reviews = ShuffleReviews(learnedMoves.Where(lm => lm.NextReviewDate < DateTime.Now).ToList())
                }
            });
        }


        [Authorize]
        [HttpPost("add-learned-move")]
        public async Task<IActionResult> AddLearnedMove([FromBody] MoveDto moveDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

                LearnedMove learnedMove = new()
                {
                    MoveId = moveDto.MoveId,
                    Id = Guid.NewGuid().ToString(),
                    UserId = userId,
                    EaseFactor = 1,
                    NextReviewDate = DateTime.UtcNow.AddHours(1),
                    MartialArtId = moveDto.MartialArtId
                };

                bool learnedMoveIsNotUnique = await _context.LearnedMoves.AnyAsync(l => l.MoveId == learnedMove.MoveId);
                if (learnedMoveIsNotUnique)
                {
                    var userLearnedMoves = await _context.LearnedMoves.Where(lm => lm.UserId == userId).ToListAsync();
                    return Ok(userLearnedMoves);
                } 

                //this might be iffy but not sure
                while (learnedMoveIsNotUnique)
                {
                    learnedMove.Id = Guid.NewGuid().ToString();
                    learnedMoveIsNotUnique = await _context.LearnedMoves.AnyAsync(l => l.Id == learnedMove.Id);
                }

                _context.LearnedMoves.Add(learnedMove);
                await _context.SaveChangesAsync();

                var userNewLearnedMoves = await _context.LearnedMoves.Where(lm => lm.UserId == userId).ToListAsync();

                return Ok(userNewLearnedMoves);
            }
            catch (Exception ex)
            {
                throw new Exception("Whoops", ex);
            }
        }


        [Authorize]
        [HttpPost("update-learned-moves")]
        public async Task<IActionResult> UpdateLearnedMoves([FromBody] List<LearnedMoveDto> learnedMovesDto)
        {
            List<LearnedMove> learnedMovesToUpdate = new();
            //validate dto

            if (!HttpContext.User.Identity.IsAuthenticated)
                return BadRequest("User unauthorized");

            if (!ModelState.IsValid)
                return BadRequest("ModelState invalid");

            //userId not found, need to figure that one out
            var userId = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return BadRequest("User not found");

            List<LearnedMove> scaffoldedDtosToLearnedMoves = new();
            foreach (LearnedMoveDto learnedMoveDto in learnedMovesDto)
            {
                LearnedMove scaffoldedDtoToLearnedMove = _context.LearnedMoves.Where(m => m.MoveId == learnedMoveDto.MoveId).FirstOrDefault();
                if (scaffoldedDtoToLearnedMove != null) scaffoldedDtosToLearnedMoves.Add(scaffoldedDtoToLearnedMove);
            }
            //will need to scaffold movesDataDtos into an array of LearnedMoves from the dbcontext
            //calculate score and put in below method
            foreach (var learnedMove in scaffoldedDtosToLearnedMoves)
            {
                LearnedMoveDto correspondingLearnedMoveDto = learnedMovesDto.Where(lmdto => lmdto.MoveId == learnedMove.MoveId).FirstOrDefault();
                double numberOfCorrectSteps = 0;
                foreach (StepDto stepDto in correspondingLearnedMoveDto.Steps) {
                    if (stepDto.IsCorrect) numberOfCorrectSteps++;
                }
                double percentageOfStepsCorrectlyAnswered = numberOfCorrectSteps / correspondingLearnedMoveDto.Steps.Count;
                LearnedMove scaffoldedLearnedMove = _mAEControllerFunctionProvider.UpdateLearnedMoveReviewData(learnedMove, percentageOfStepsCorrectlyAnswered);
                learnedMovesToUpdate.Add(scaffoldedLearnedMove);
            }


            await _context.SaveChangesAsync();

            return Ok(200);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            //perform validation on DTO
            IActionResult response = Unauthorized();
            var user = await _userManager.FindByEmailAsync(request.Email);
            _signInManager.AuthenticationScheme = IdentityConstants.BearerScheme;
            Microsoft.AspNetCore.Identity.SignInResult result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
            {
                return response;
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

            var accessToken = _tokenProvider.CreateAccessToken(user, ipAddress);

            Response.Cookies.Append("access_token", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // True when in production
                SameSite = SameSiteMode.None,
            });

            var thing = await _context.LearnedMoves.ToListAsync();

            var learnedMovesResponse = await _context.LearnedMoves.Where(lm => lm.UserId == user.Id && lm.NextReviewDate < DateTime.UtcNow).ToListAsync();
            List<LearnedMove> learnedMoves = new();
            learnedMoves.AddRange(learnedMovesResponse);

            return Ok(new
            {
                user = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    LearnedMoves = learnedMoves,
                    Reviews = ShuffleReviews(learnedMoves.Where(lm => lm.NextReviewDate < DateTime.Now).ToList())
                }
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            Console.WriteLine(User);

            //only useful when using Identity's tokens
            // await _signInManager.SignOutAsync();

            Response.Cookies.Delete("access_token");

            return Ok();
        }


        private static List<LearnedMove> ShuffleReviews(List<LearnedMove> reviews)
        {
            List<LearnedMove> shuffledReviews = new();

            List<int> numbersAssigned = [];

            Random random = new();
            for (int i = 0; i < reviews.Count; i++)
            {
                while (true)
                {
                    int randomNumber = random.Next(0, reviews.Count);
                    if (!numbersAssigned.Contains(randomNumber))
                    {
                        shuffledReviews.Add(reviews[i]);
                        numbersAssigned.Add(randomNumber);
                        break;
                    }
                }
            }
            return shuffledReviews;
        }
    }

    public class RegisterFormRequest {
        [Required(AllowEmptyStrings = false, ErrorMessage = "First Name is required.")]
        [MaxLength(50, ErrorMessage = "First Name must be less than 50 characters")]
        public string FirstName { get; set;}

        [Required(AllowEmptyStrings = false, ErrorMessage = "Last Name is required.")]
        [MaxLength(50, ErrorMessage = "Last Name must be less than 50 characters")]
        public string LastName { get; set;}

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(100, ErrorMessage = "Email must be less than 100 characters")]
        public string Email { get; set;}

        [Required(ErrorMessage = "Password is required")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
        [RegularExpression(@"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$", 
            ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, and one number")]
        public string Password { get; set;}

        [Required(ErrorMessage = "Please confirm your Password")]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set;}
    }
}
