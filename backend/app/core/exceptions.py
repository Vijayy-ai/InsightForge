class BaseError(Exception):
    """Base class for all custom exceptions"""
    pass

class DatabaseConnectionError(BaseError):
    """Raised when database connection fails"""
    def __init__(self, message: str, code: str = None, details: dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)

class DataProcessingError(BaseError):
    """Raised when data processing fails"""
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(BaseError):
    """Raised when data validation fails"""
    def __init__(self, message: str, field: str = None, details: dict = None):
        self.message = message
        self.field = field
        self.details = details or {}
        super().__init__(self.message)

class ReportGenerationError(BaseError):
    """Raised when report generation fails"""
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class AuthenticationError(BaseError):
    """Raised when authentication fails"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message)

class ConfigurationError(BaseError):
    """Raised when there's a configuration error"""
    def __init__(self, message: str, missing_keys: list = None):
        self.missing_keys = missing_keys or []
        super().__init__(message) 