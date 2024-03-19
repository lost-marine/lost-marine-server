import { errorMessages } from "./error-codes";
import { successMessages } from "./success-codes";

export function getSuccessMessage(successCode: string, locale: string = "ko"): string {
  if (successMessages[successCode] === undefined) {
    return "Unknown success code.";
  }

  return successMessages[successCode][locale];
}

export function getErrorMessage(error: Error | unknown, locale: string = "ko"): string {
  if (error instanceof Error) {
    const errorCode: string = error.message;
    return errorMessages[errorCode][locale];
  }
  return "Unknown error.";
}
