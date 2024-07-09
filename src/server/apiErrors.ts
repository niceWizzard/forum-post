export enum ApiError {
  AuthRequired,
  Unathorized,
  CreateError,
  PostError,
  UpdateError,
  DeleteError,

  ForumNotFound,
  PostNotFound,
  UserNotFound,

  UnknownError,
  UsernameAlreadyExists,
  ForumNameAlreadyExists,

  MissingParameter,
  InvalidParameter,

  InvalidToken,

  UserAlreadyExists,
  UserDoesNotExist,
}
