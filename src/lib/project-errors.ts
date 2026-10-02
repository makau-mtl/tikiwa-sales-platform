type SupabaseDatabaseError = {
  code: string;
  message: string;
  details?: string;
  hint?: string;
};

function getSupabaseDatabaseError(error: unknown): SupabaseDatabaseError | null {
  if (typeof error !== "object" || error === null || !("code" in error) || !("message" in error)) {
    return null;
  }

  const { code, message } = error;
  if (typeof code !== "string" || typeof message !== "string") return null;

  return {
    code,
    message,
    ...( "details" in error && typeof error.details === "string" ? { details: error.details } : {}),
    ...( "hint" in error && typeof error.hint === "string" ? { hint: error.hint } : {}),
  };
}

function friendlyProjectSaveError(code: string) {
  switch (code) {
    case "23502":
      return "Some required project information is missing. Review the project details and try again.";
    case "23505":
      return "A project with conflicting information already exists. Check the project name and try again.";
    case "42501":
      return "You do not have permission to save this project. Contact an administrator.";
    case "PGRST204":
    case "42703":
      return "Project details could not be saved. Please try again.";
    default:
      return "The project could not be saved. Please try again.";
  }
}

export function projectSaveErrorMessage(error: unknown, isDevelopment = process.env.NODE_ENV !== "production") {
  const databaseError = getSupabaseDatabaseError(error);
  if (databaseError) {
    if (!isDevelopment) {
      console.error("[project-save] Supabase database error", databaseError);
      return friendlyProjectSaveError(databaseError.code);
    }

    return [
      `Postgres code: ${databaseError.code}`,
      `Supabase message: ${databaseError.message}`,
      ...(databaseError.details ? [`Details: ${databaseError.details}`] : []),
    ].join("\n");
  }

  if (error instanceof Error && /schema cache|column .* does not exist/i.test(error.message)) {
    return isDevelopment
      ? error.message
      : "Project details could not be saved. Please try again.";
  }

  return error instanceof Error ? error.message : "The project could not be saved.";
}