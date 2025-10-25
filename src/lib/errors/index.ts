// Error handling system for the application
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, true, "AUTHENTICATION_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, true, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, true, "NOT_FOUND_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, true, "CONFLICT_ERROR");
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, true, "RATE_LIMIT_ERROR");
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, true, "DATABASE_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = "External service error") {
    super(message, 502, true, "EXTERNAL_SERVICE_ERROR");
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): {
  error: string;
  statusCode: number;
  code?: string;
  details?: any;
  timestamp: string;
} {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const details = Object.values((error as any).errors).map((err: any) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));

      return {
        error: "Validation failed",
        statusCode: 400,
        code: "VALIDATION_ERROR",
        details,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle Mongoose cast errors
    if (error.name === "CastError") {
      return {
        error: "Invalid ID format",
        statusCode: 400,
        code: "INVALID_ID",
        timestamp: new Date().toISOString(),
      };
    }

    // Handle MongoDB duplicate key errors
    if ((error as any).code === 11000) {
      const field = Object.keys((error as any).keyValue)[0];
      return {
        error: `${field} already exists`,
        statusCode: 409,
        code: "DUPLICATE_KEY",
        details: { field, value: (error as any).keyValue[field] },
        timestamp: new Date().toISOString(),
      };
    }

    // Handle JWT errors
    if (error.name === "JsonWebTokenError") {
      return {
        error: "Invalid token",
        statusCode: 401,
        code: "INVALID_TOKEN",
        timestamp: new Date().toISOString(),
      };
    }

    if (error.name === "TokenExpiredError") {
      return {
        error: "Token expired",
        statusCode: 401,
        code: "TOKEN_EXPIRED",
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Default error
  return {
    error: "Internal server error",
    statusCode: 500,
    code: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  };
}

// Client-side error handler
export class ErrorHandler {
  static handle(error: unknown): {
    message: string;
    code?: string;
    statusCode?: number;
    details?: any;
  } {
    console.error("Client Error:", error);

    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    if (typeof error === "object" && error !== null) {
      const err = error as any;
      return {
        message: err.error || err.message || "An error occurred",
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
      };
    }

    return {
      message: "An unexpected error occurred",
    };
  }

  static async handleApiResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AppError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        true,
        errorData.code,
        errorData.details,
      );
    }
    return response;
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && error.message.includes("fetch");
  }

  static isTimeoutError(error: unknown): boolean {
    return error instanceof Error && error.message.includes("timeout");
  }
}

// Form validation error formatter
export function formatValidationErrors(errors: any[]): Record<string, string> {
  const formatted: Record<string, string> = {};

  errors.forEach((error) => {
    if (typeof error === "object" && error.field && error.message) {
      formatted[error.field] = error.message;
    }
  });

  return formatted;
}

// Retry utility with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on client errors (4xx) except 408, 429
      if (error instanceof AppError) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          if (error.statusCode !== 408 && error.statusCode !== 429) {
            break;
          }
        }
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Error boundary for React components
export class ErrorBoundary {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  static componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Here you could send error to logging service
    // logErrorToService(error, errorInfo);
  }
}

// Logging utilities
export const logger = {
  error: (message: string, error?: unknown, context?: any) => {
    console.error(`[ERROR] ${message}`, {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  },

  warn: (message: string, context?: any) => {
    console.warn(`[WARN] ${message}`, {
      context,
      timestamp: new Date().toISOString(),
    });
  },

  info: (message: string, context?: any) => {
    console.info(`[INFO] ${message}`, {
      context,
      timestamp: new Date().toISOString(),
    });
  },

  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Error reporting (placeholder for external service integration)
export async function reportError(error: Error, context?: any) {
  // In production, you would integrate with services like Sentry, Bugsnag, etc.
  logger.error("Reported error", error, context);
}
