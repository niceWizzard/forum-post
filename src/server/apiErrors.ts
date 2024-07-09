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
}
