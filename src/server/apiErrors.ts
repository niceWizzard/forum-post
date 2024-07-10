export enum ApiError {
  AuthRequired = 1,
  Unathorized = 2,
  CreateError = 3,
  PostError = 4,
  UpdateError = 5,
  DeleteError = 6,

  ForumNotFound = 7,
  PostNotFound = 8,
  UserNotFound = 9,

  UnknownError = 10,
  UsernameAlreadyExists = 11,
  ForumNameAlreadyExists = 12,

  MissingParameter = 13,
  InvalidParameter = 14,

  InvalidToken = 15,

  UserAlreadyExists = 16,
  UserDoesNotExist = 17,
  ProviderNotConnected = 18,
  CommentNotFound = 19,
}

export function getErrorMessage(err: ApiError | string): string {
  if (typeof err === "string") {
    err = Number(err);
  }

  switch (err) {
    case ApiError.UserAlreadyExists:
      return "An account with the email already exists.";
    case ApiError.UserDoesNotExist:
      return "User not found.";
    case ApiError.UnknownError:
      return "An unexpected error occurred.";
    case ApiError.AuthRequired:
      return "Authentication required.";
    case ApiError.Unathorized:
      return "Unauthorized access.";
    case ApiError.CreateError:
      return "Failed to create.";
    case ApiError.PostError:
      return "Failed to post.";
    case ApiError.UpdateError:
      return "Failed to update.";
    case ApiError.DeleteError:
      return "Failed to delete.";
    case ApiError.ForumNotFound:
      return "Forum not found.";
    case ApiError.PostNotFound:
      return "Post not found.";
    case ApiError.UserNotFound:
      return "User not found.";
    case ApiError.UsernameAlreadyExists:
      return "Username already exists.";
    case ApiError.ForumNameAlreadyExists:
      return "Forum name already exists.";
    case ApiError.MissingParameter:
      return "Missing parameter.";
    case ApiError.InvalidParameter:
      return "Invalid parameter.";
    case ApiError.InvalidToken:
      return "Invalid token.";
    case ApiError.ProviderNotConnected:
      return "No account connected to that provider.";
    default:
      return "Uknown error type.";
  }
}
