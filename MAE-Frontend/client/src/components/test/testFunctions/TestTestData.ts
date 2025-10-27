export type MartialArt = {
  id: string,
  name: string,
  moves: Move[]
}

export type Move = {
  id : string,
  martialArtId : string,
  martialArtName: string,
  name : string,
  shortName: string,
  steps : Step[],
  url : string,
  learningOrderNumber: number,
  moveNumber: number
}

export type LessonMove = Omit<Move, 'steps'> & {
  steps : LessonStep[]
}

export type TestMove = Omit<Move, 'learningOrderNumber' | 'url'> & {
  steps : TestStep[],
  moveNumber : number
  //define martialArtName, scaffold that when creating object using martialArtId
}

export type Step = {
  id : string,
  moveId: string;
  name: string,
  stepNumber : number,
  stepOptions : StepOption[],
  shortDescription? : string;
  fullDescription : string;
  videoClipStartTime : number;
  videoClipEndTime : number
}

export type LessonStep = Omit<Step, 'stepOptions'> 

export type TestStep = Omit<Step, 'shortDescription' | 'videoClipStartTime' | 'videoClipEndTime'> & {
  answered : boolean,
  isCorrect : boolean
}

export type StepOption = {
  id : string,
  targetParentStepId : string,
  isRealStep: boolean,
  idOfStepUsedForData: boolean,
}

export type TestStepOption = Omit<StepOption, 'targetParentStepId' | 'idOfStepUsedForData'> & {
  name : string,
  shortDescription? : string,
  fullDescription: string,
}