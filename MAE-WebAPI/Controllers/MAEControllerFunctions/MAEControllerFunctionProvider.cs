using System;
using MAE_WebAPI.Models;

namespace MAE_WebAPI.Controllers.MAEControllerFunctions
{
    //need to register this as a service and DI it
    public class MAEControllerFunctionProvider
    {
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

            //should probably declare useing the new keyword and copy each property over to the new LearnedMove
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
    }
}
