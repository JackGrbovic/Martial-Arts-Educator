import { TestStepOption } from "./TestTestData"

export default function DetermineOptionColor(option : TestStepOption){
    if (option.selected 
        && !option.isRealStep) {
            return "incorrect-answer"}
    if (option.selected 
        && option.isRealStep) return "correct-answer"
    return "background-color-2 button-hover"
}

export function DetermineOptionColorForResults(option : TestStepOption){
    if (!option.isRealStep) {
            return "incorrect-answer"}
    return "correct-answer"
}