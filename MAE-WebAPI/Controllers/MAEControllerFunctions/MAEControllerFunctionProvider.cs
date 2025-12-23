using System;
using MAE_WebAPI.Auth;
using MAE_WebAPI.Data;
using MAE_WebAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.VisualBasic;
using Resend;

namespace MAE_WebAPI.Controllers.MAEControllerFunctions
{
    //need to register this as a service and DI it
    public class MAEControllerFunctionProvider
    {
        private readonly MAEDbContext _context;
        private static string _resendKey;
        IResend resend = ResendClient.Create(_resendKey);
        public MAEControllerFunctionProvider(MAEDbContext mAEDbContext, IOptions<ResendOptions> options)
        {
            _resendKey = options.Value.ApiKey;
            _context = mAEDbContext;
        }
        private Dictionary<double, double> EaseBandings = new()
        {
            {0.1, 0.5},
            {0.2, 0.6},
            {0.3, 0.7},
            {0.4, 0.8},
            {0.5, 0.9},
            {0.6, 1},
            {0.7, 1.1},
            {0.8, 1.2},
            {0.9, 1.3},
            {1, 1.7}
        };

        public LearnedMove UpdateLearnedMoveReviewData(LearnedMove learnedMove, double percentageOfStepsCorrectlyAnswered)
        {
            if (learnedMove == null)
            {
                throw new ArgumentNullException(nameof(learnedMove), "LearnedMove cannot be null");
            }

            double existingEaseFactor = learnedMove.EaseFactor;
            double newEaseFactor = EaseBandings[Math.Round(
                percentageOfStepsCorrectlyAnswered == 0 ? 0.1 :
                percentageOfStepsCorrectlyAnswered, 1)] * existingEaseFactor;

            LearnedMove learnedMoveToReturn = learnedMove;
            learnedMoveToReturn.EaseFactor = newEaseFactor;
            DateTime newDateTime = DateTime.UtcNow;
            if (newEaseFactor >= 1)
            {
                double remainder = newEaseFactor % 1;
                double daysToAdd = newEaseFactor - remainder;
                newDateTime = newDateTime.AddDays(daysToAdd);

                double hoursToAdd = Math.Round(remainder * 24, 1);
                newDateTime = newDateTime.AddHours(hoursToAdd);
            }
            else
            {
                double roughHours = Math.Round(newEaseFactor * 24, 1);
                double remainder = roughHours % 1;
                double hoursToAdd = roughHours - remainder;
                newDateTime = newDateTime.AddHours(hoursToAdd);
            }
            learnedMoveToReturn.NextReviewDate = newDateTime;

            return learnedMoveToReturn;
        }

        public async Task CreateAndSendMagicLink(bool isLogin, HttpRequest Request, ApplicationUser user, TokenProvider _tokenProvider, string email, Hasher _hasher)
        {
            var magicLinkTokenHash = _hasher.Hash(_tokenProvider.GenerateRandomToken());

            MagicLinkToken magicLinkToken = new MagicLinkToken
            {
                Id = Guid.NewGuid().ToString(),
                TokenHash = magicLinkTokenHash,
                UserId = user.Id,
                ExpiryDate = DateTime.UtcNow.AddMinutes(5),
                ApplicationUser = user,
                Created = DateTime.UtcNow,
                IsRevoked = false
            };

            await _context.MagicLinkTokens.AddAsync(magicLinkToken);
            await _context.SaveChangesAsync();

            string loginLinkSegment = "login-with-link";
            string registrationLinkSegment = "complete-registration";
            
            string loginUrl = isLogin? $"{Request.Scheme}://maeapp.net/{loginLinkSegment}?tokenHash={magicLinkTokenHash}" :
                $"{Request.Scheme}://maeapp.net/{registrationLinkSegment}?tokenHash={magicLinkTokenHash}";

            

            string emailBody = isLogin? $"<p>Please use <a href=\"{loginUrl}\">this link</a> to log in.</p>" :
                $"<p>Thank you for registering. Please use <a href=\"{loginUrl}\">this link</a> to complete your registration and log in.</p>";
            
            await resend.EmailSendAsync( new EmailMessage()
            {
                From = "services@maeapp.net",
                To = email,
                Subject = "Magic Link",
                HtmlBody = emailBody,
            } );
        }

        public List<LearnedMoveDto> ShuffleReviews(List<LearnedMoveDto> reviews)
        {
            List<LearnedMoveDto> shuffledReviews = new();

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

        public record MagicLinkResult(bool Success, string ErrorMessage);
    }

    public class ResendOptions
    {
        public string ApiKey { get; set; } = null!;
    }

    public class MAESignInHandler
    {
        private readonly MAEDbContext _context;
        public MAESignInHandler(MAEDbContext mAEDbContext)
        {
            _context = mAEDbContext;
        }
        public async Task<SignInResult> SignInAsync(string tokenHash, TokenProvider _tokenProvider, Hasher _hasher, HttpResponse response, MAEControllerFunctionProvider mAEControllerFunctionProvider)
        {
            var magicLinkToken = await _context.MagicLinkTokens.FirstOrDefaultAsync(
                x => x.TokenHash == tokenHash &&
                x.IsRevoked == false
            );
            
            if (magicLinkToken == null) return SignInResult.Fail("Link is expired or invalid.");

            if (magicLinkToken.ExpiryDate < DateTime.UtcNow)
            {
                magicLinkToken.IsRevoked = true;
                await _context.SaveChangesAsync();
                return SignInResult.Fail("Link is expired or invalid.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == magicLinkToken.UserId);
            if (user == null)
            {
               return SignInResult.Fail("Link is expired or invalid."); 
            } 

            if(user.EmailConfirmed == false)
            {
                return SignInResult.Fail("User's email is not confirmed."); 
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

            await _context.RefreshTokens.AddAsync(newRefreshToken);
            await _context.SaveChangesAsync();

            response.Cookies.Append("refresh_token", newRefreshToken.TokenHash, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(20)
            });

            var learnedMoveDtos = await _context.LearnedMoves.Where(lm => lm.UserId == user.Id && lm.NextReviewDate < DateTime.UtcNow).Select(lm => new LearnedMoveDto
            {
                Id = lm.Id,
                MoveId = lm.MoveId,
                UserId = lm.UserId,
                MartialArtId = lm.MartialArtId,
                EaseFactor = lm.EaseFactor,
                NextReviewDate = lm.NextReviewDate
            }).ToListAsync();

            return SignInResult.Ok( 
                new ResponseUserDto {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName,
                    LearnedMoves = learnedMoveDtos,
                    Reviews = mAEControllerFunctionProvider.ShuffleReviews(learnedMoveDtos.Where(lm => lm.NextReviewDate < DateTime.Now).ToList())
                },
                newAccessToken
            );
        }

        public async Task<CompleteRegistrationResult> CompleteRegistrationAsync(string tokenHash, TokenProvider _tokenProvider, Hasher _hasher, HttpResponse response, MAEControllerFunctionProvider mAEControllerFunctionProvider, List<LearnedMoveDto>? registrationLearnedMoveDtos)
        {
            var magicLinkToken = await _context.MagicLinkTokens.FirstOrDefaultAsync(
                x => x.TokenHash == tokenHash &&
                x.IsRevoked == false
            );
            
            if (magicLinkToken == null) return CompleteRegistrationResult.Fail("Link is expired or invalid.");

            if (magicLinkToken.ExpiryDate < DateTime.UtcNow)
            {
                magicLinkToken.IsRevoked = true;
                await _context.SaveChangesAsync();
                return CompleteRegistrationResult.Fail("Link is expired or invalid.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == magicLinkToken.UserId);
            if (user == null)
            {
               return CompleteRegistrationResult.Fail("Link is expired or invalid."); 
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

            await _context.RefreshTokens.AddAsync(newRefreshToken);
            await _context.SaveChangesAsync();

            var learnedMoveDtos = registrationLearnedMoveDtos?.Count() > 0 ? registrationLearnedMoveDtos : await _context.LearnedMoves.Where(lm => lm.UserId == user.Id && lm.NextReviewDate < DateTime.UtcNow).Select(lm => new LearnedMoveDto
            {
                Id = lm.Id,
                MoveId = lm.MoveId,
                UserId = lm.UserId,
                MartialArtId = lm.MartialArtId,
                EaseFactor = lm.EaseFactor,
                NextReviewDate = lm.NextReviewDate
            }).ToListAsync();

            return CompleteRegistrationResult.Ok( 
                new ResponseUserDto {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName,
                    LearnedMoves = learnedMoveDtos,
                    Reviews = mAEControllerFunctionProvider.ShuffleReviews(learnedMoveDtos.Where(lm => lm.NextReviewDate < DateTime.Now).ToList())
                },
                newAccessToken
            );
        }
    }

    public class SignInResult
    {
        public bool Success { get; }
        public string? Error { get; }
        public ResponseUserDto? User { get; }
        public string? RefreshTokenHash { get; }

        private SignInResult(bool success, ResponseUserDto? user, string? refreshTokenHash, string? error)
        {
            Success = success;
            User = user;
            RefreshTokenHash = refreshTokenHash;
            Error = error;
        }

        public static SignInResult Ok(ResponseUserDto user, string refreshTokenHash)
            => new(true, user, refreshTokenHash, null);

        public static SignInResult Fail(string error)
            => new(false, null, null, error);
    }

    public class CompleteRegistrationResult
    {
        public bool Success { get; }
        public string? Error { get; }
        public ResponseUserDto? User { get; }
        public string? RefreshTokenHash { get; }

        private CompleteRegistrationResult(bool success, ResponseUserDto? user, string? refreshTokenHash, string? error)
        {
            Success = success;
            User = user;
            RefreshTokenHash = refreshTokenHash;
            Error = error;
        }

        public static CompleteRegistrationResult Ok(ResponseUserDto user, string refreshTokenHash)
            => new(true, user, refreshTokenHash, null);

        public static CompleteRegistrationResult Fail(string error)
            => new(false, null, null, error);
    }
}
