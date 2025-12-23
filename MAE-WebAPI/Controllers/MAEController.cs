using Microsoft.AspNetCore.Mvc;
using MAE_WebAPI.Models;
using MAE_WebAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using System.ComponentModel.DataAnnotations;
using MAE_WebAPI.Auth;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MAE_WebAPI.Controllers.MAEControllerFunctions;
using Resend;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.Extensions.Options;

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
        private readonly Hasher _hasher;
        private readonly MAESignInHandler _mAESignInHandler;
        private static string _resendKey;

        public MAEController(MAEDbContext context, UserManager<ApplicationUser> userManager, TokenProvider tokenProvider, SignInManager<ApplicationUser> signInManager, MAEControllerFunctionProvider mAEControllerFunctionProvider, Hasher hasher, MAESignInHandler mAESignInHandler, IOptions<ResendOptions> options)
        {
            _context = context;
            _userManager = userManager;
            _tokenProvider = tokenProvider;
            _signInManager = signInManager;
            _mAEControllerFunctionProvider = mAEControllerFunctionProvider;
            _hasher = hasher;
            _mAESignInHandler = mAESignInHandler;
            _resendKey = options.Value.ApiKey;
        }


        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegistrationDto registrationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userInDbByEmail = await _context.Users.FirstOrDefaultAsync(x => x.Email == registrationDto.Email);
                if (userInDbByEmail != null && userInDbByEmail.EmailConfirmed == true)
                {
                    return BadRequest("Email already in use.");
                }

                var userInDbByUsername = await _context.Users.FirstOrDefaultAsync(x => x.UserName == registrationDto.UserName);
                if (userInDbByUsername != null && userInDbByEmail.EmailConfirmed == true)
                {
                    return BadRequest("Username already in use.");
                }

                if (userInDbByEmail != null && userInDbByEmail.EmailConfirmed != true)
                {
                    await _mAEControllerFunctionProvider.CreateAndSendMagicLink(false, Request, userInDbByEmail, _tokenProvider, registrationDto.Email, _hasher);
                    return Ok();
                }

                var user = new ApplicationUser
                {
                    UserName = registrationDto.UserName,
                    Email = registrationDto.Email
                };

                var result = await _userManager.CreateAsync(user);

                if (!result.Succeeded)
                {
                    return BadRequest(ModelState);
                }
                
                await _mAEControllerFunctionProvider.CreateAndSendMagicLink(false, Request, user, _tokenProvider, registrationDto.Email, _hasher);

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR: " + ex.Message);
                return BadRequest("Unable to register user.");
            }
        }

        [HttpPost("delete-grob")]
        public async Task<IActionResult> DeleteGrob()
        {
            await _context.Users.Where(x => x.Email == "jackgrbovic@googlemail.com").ExecuteDeleteAsync();
            return Ok();
        }

        [HttpPost("complete-registration")]
        public async Task<IActionResult> CompleteRegistration(CompleteRegistrationDto completeRegistrationDto)
        {
            List<LearnedMove> registrationLearnedMoves = new();
            foreach(TempUserLearnedMoveDto tempUserLearnedMove in completeRegistrationDto.TempUserLearnedMoves)
            {
                registrationLearnedMoves.Add(new LearnedMove
                {
                    MoveId = tempUserLearnedMove.MoveId,
                    Id = Guid.NewGuid().ToString(),
                    UserId = tempUserLearnedMove.UserId,
                    EaseFactor = 1,
                    NextReviewDate = DateTime.UtcNow.AddHours(1),
                    MartialArtId = tempUserLearnedMove.MartialArtId
                });
            }

            List<LearnedMoveDto> registrationLearnedMoveDtos = new();
            foreach(TempUserLearnedMoveDto tempUserLearnedMove in completeRegistrationDto.TempUserLearnedMoves)
            {
                registrationLearnedMoveDtos.Add(new LearnedMoveDto
                {
                    MoveId = tempUserLearnedMove.MoveId,
                    Id = Guid.NewGuid().ToString(),
                    UserId = tempUserLearnedMove.UserId,
                    EaseFactor = 1,
                    NextReviewDate = DateTime.UtcNow.AddHours(1),
                    MartialArtId = tempUserLearnedMove.MartialArtId
                });
            }

            var signInResult = await _mAESignInHandler.CompleteRegistrationAsync(completeRegistrationDto.tokenHash, _tokenProvider, _hasher, Response, _mAEControllerFunctionProvider, registrationLearnedMoveDtos);
            
            if (signInResult.Success == false)
            {
                return BadRequest("Failed to complete registration.");
            }

            var userInDb = await _context.Users.FirstOrDefaultAsync(x => x.Id == signInResult.User.Id);
            if (userInDb != null) userInDb.EmailConfirmed = true;
            if (registrationLearnedMoves.Count() > 0) 
            {
                userInDb.LearnedMoves = registrationLearnedMoves;
            }

            RefreshToken refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid().ToString(),
                TokenHash = signInResult.RefreshTokenHash,
                UserId = userInDb.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(20),
                ApplicationUser = userInDb,
                Created = DateTime.UtcNow,
                IsRevoked = false
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            var newAccessToken = _tokenProvider.CreateTokenUsingUser(userInDb);
            Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(5)
            });

            Response.Cookies.Append("refresh_token", signInResult.RefreshTokenHash, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(20)
            });

            return Ok(signInResult.User);
        }

        [AllowAnonymous]
        [HttpPost("login-link-request")]
        public async Task<IActionResult> LoginLinkRequest(LoginLinkRequestDto loginLinkRequestDto)
        {
            //for the data need to ensure it maps properly between js and .net, can't remember how but a DTO is probably necessary
            var userFromEmail = await _context.Users.FirstOrDefaultAsync(x => x.Email == loginLinkRequestDto.email);
            if (userFromEmail == null)
            {
                return BadRequest("Email not registered.");
            }
            else if (userFromEmail != null)
            {
                await _mAEControllerFunctionProvider.CreateAndSendMagicLink(true, Request, userFromEmail, _tokenProvider, loginLinkRequestDto.email, _hasher);
                return Ok();
            } 
            return BadRequest("Email not registered.");
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginHashDto loginHashDto)
        {
            //maybe veryify tokenHash in some way but not sure how
            var signInResult = await _mAESignInHandler.SignInAsync(loginHashDto.tokenHash, _tokenProvider, _hasher, Response, _mAEControllerFunctionProvider);
            if (signInResult.Success == false)
            {
                return BadRequest("Unable to login. Please try again or contact the system administrator.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == signInResult.User.Id);

            RefreshToken refreshToken = new RefreshToken
            {
                Id = Guid.NewGuid().ToString(),
                TokenHash = signInResult.RefreshTokenHash,
                UserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddDays(20),
                ApplicationUser = user,
                Created = DateTime.UtcNow,
                IsRevoked = false
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            var newAccessToken = _tokenProvider.CreateTokenUsingUser(user);
            Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(5)
            });

            Response.Cookies.Append("refresh_token", signInResult.RefreshTokenHash, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(20)
            });

            return Ok(signInResult.User);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
            });

            return Ok();
        }



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
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
                //delete token
                return Unauthorized("No token found. Continuing with tempUser");

            var tokenHandler = new JwtSecurityTokenHandler();

            //the below may be vulnerable to a timing attack, might want to set it to a fixed time
            var tokenInDb = _context.RefreshTokens.FirstOrDefault(x => x.TokenHash == refreshToken);
            //if no token return error
            if (tokenInDb == null || tokenInDb.IsRevoked) return Unauthorized("User not found. Continuing with tempUser");
            
            if (tokenInDb.UserId == null)
            {
                //delete token
                return Unauthorized("User not found. Continuing with tempUser");
            }

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == tokenInDb.UserId);

            if (user == null)
            {
                //delete token
                return Unauthorized("User not found. Continuing with tempUser");
            }
            
            var newAccessToken = _tokenProvider.CreateTokenUsingUser(user);
            var newRefreshToken = new RefreshToken{
                Id = Guid.NewGuid().ToString(),
                UserId = user.Id,
                TokenHash = _hasher.Hash(_tokenProvider.GenerateRandomToken()),
                ExpiryDate = DateTime.UtcNow.AddDays(20),
                ApplicationUser = user,
                Created = DateTime.UtcNow,
                IsRevoked = false
            };

            tokenInDb.IsRevoked = true;
            await _context.RefreshTokens.AddAsync(newRefreshToken);
            await _context.SaveChangesAsync();

            Response.Cookies.Append("access_token", newAccessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(5)
            });

            Response.Cookies.Append("refresh_token", newRefreshToken.TokenHash, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                //SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(20)
            });

            var learnedMoveDtos = await _context.LearnedMoves.Where(lm => lm.UserId == user.Id).Select(lm => new LearnedMoveDto
                {
                    Id = lm.Id,
                    MoveId = lm.MoveId,
                    UserId = lm.UserId,
                    MartialArtId = lm.MartialArtId,
                    EaseFactor = lm.EaseFactor,
                    NextReviewDate = lm.NextReviewDate
                }).ToListAsync();

            return Ok(new
            {
                user = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    LearnedMoves = learnedMoveDtos,
                    Reviews = _mAEControllerFunctionProvider.ShuffleReviews(learnedMoveDtos.Where(lm => lm.NextReviewDate < DateTime.Now).ToList())
                }
            });
        }

        //figure out how to make authorized work, it's not happy with the current setup
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

                //reconfigure auth here. Can we make a modular method to apply to each authorized endpoint?
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
        public async Task<IActionResult> UpdateLearnedMoves([FromBody] List<UpdateLearnedMoveDto> learnedMovesDto)
        {
            List<LearnedMove> learnedMovesToUpdate = new();
            //ensure the auth for this works with refresh tokens, same for add-learned-moves

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
            foreach (UpdateLearnedMoveDto learnedMoveDto in learnedMovesDto)
            {
                LearnedMove scaffoldedDtoToLearnedMove = await _context.LearnedMoves.Where(m => m.MoveId == learnedMoveDto.MoveId).FirstOrDefaultAsync();
                if (scaffoldedDtoToLearnedMove != null) scaffoldedDtosToLearnedMoves.Add(scaffoldedDtoToLearnedMove);
            }
            //will need to scaffold movesDataDtos into an array of LearnedMoves from the dbcontext
            //calculate score and put in below method
            foreach (var learnedMove in scaffoldedDtosToLearnedMoves)
            {
                UpdateLearnedMoveDto correspondingLearnedMoveDto = learnedMovesDto.Where(lmdto => lmdto.MoveId == learnedMove.MoveId).FirstOrDefault();
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
