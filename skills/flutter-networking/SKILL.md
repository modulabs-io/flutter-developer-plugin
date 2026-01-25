# /flutter-networking

Set up networking with Dio, Retrofit, and best practices for API communication.

## Usage

```
/flutter-networking <command> [options]
```

## Commands

- `init`: Initialize Dio client configuration
- `retrofit`: Set up Retrofit code generation
- `interceptors`: Configure request/response interceptors
- `mock`: Create mock client for testing

## Options

- `--auth`: Include authentication interceptor
- `--cache`: Add response caching
- `--retry`: Configure retry logic
- `--logging`: Enable request/response logging

## Examples

```
/flutter-networking init --auth --logging
/flutter-networking retrofit
/flutter-networking interceptors --auth --retry
/flutter-networking mock
```

## Instructions

When the user invokes `/flutter-networking`, follow these steps:

### 1. Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  dio: ^5.7.0
  retrofit: ^4.4.1
  json_annotation: ^4.9.0
  pretty_dio_logger: ^1.4.0
  connectivity_plus: ^6.1.0
  dio_cache_interceptor: ^3.5.0

dev_dependencies:
  retrofit_generator: ^9.1.2
  json_serializable: ^6.8.0
  build_runner: ^2.4.13
```

```bash
flutter pub get
```

### 2. Dio Client Configuration

**lib/core/network/dio_client.dart**:
```dart
import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../config/app_config.dart';
import 'interceptors/auth_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/retry_interceptor.dart';

class DioClient {
  late final Dio _dio;

  DioClient({
    required String baseUrl,
    Map<String, dynamic>? headers,
    Duration? connectTimeout,
    Duration? receiveTimeout,
  }) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        headers: headers ?? _defaultHeaders,
        connectTimeout: connectTimeout ?? const Duration(seconds: 30),
        receiveTimeout: receiveTimeout ?? const Duration(seconds: 30),
        contentType: Headers.jsonContentType,
        responseType: ResponseType.json,
      ),
    );

    _setupInterceptors();
  }

  Map<String, dynamic> get _defaultHeaders => {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

  void _setupInterceptors() {
    _dio.interceptors.addAll([
      // Auth interceptor
      AuthInterceptor(),

      // Error handling interceptor
      ErrorInterceptor(),

      // Retry interceptor
      RetryInterceptor(dio: _dio),

      // Logging (only in debug mode)
      if (AppConfig.instance.enableLogging)
        PrettyDioLogger(
          requestHeader: true,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          compact: true,
          maxWidth: 90,
        ),
    ]);
  }

  Dio get dio => _dio;

  // GET request
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  // POST request
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  // PUT request
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  // PATCH request
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  // DELETE request
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  // Upload file
  Future<Response<T>> uploadFile<T>(
    String path, {
    required String filePath,
    required String fieldName,
    Map<String, dynamic>? data,
    ProgressCallback? onSendProgress,
    CancelToken? cancelToken,
  }) async {
    final formData = FormData.fromMap({
      ...?data,
      fieldName: await MultipartFile.fromFile(filePath),
    });

    return _dio.post<T>(
      path,
      data: formData,
      onSendProgress: onSendProgress,
      cancelToken: cancelToken,
    );
  }

  // Download file
  Future<Response> downloadFile(
    String url,
    String savePath, {
    ProgressCallback? onReceiveProgress,
    CancelToken? cancelToken,
  }) async {
    return _dio.download(
      url,
      savePath,
      onReceiveProgress: onReceiveProgress,
      cancelToken: cancelToken,
    );
  }
}
```

### 3. Interceptors

**lib/core/network/interceptors/auth_interceptor.dart**:
```dart
import 'package:dio/dio.dart';
import '../../services/auth_service.dart';

class AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip auth for public endpoints
    if (options.extra['requiresAuth'] == false) {
      return handler.next(options);
    }

    final token = await AuthService.instance.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Attempt token refresh
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the request with new token
        final retryResponse = await _retryRequest(err.requestOptions);
        return handler.resolve(retryResponse);
      } else {
        // Logout user
        await AuthService.instance.logout();
      }
    }

    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await AuthService.instance.getRefreshToken();
      if (refreshToken == null) return false;

      final response = await Dio().post(
        '${AppConfig.instance.baseUrl}/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final newAccessToken = response.data['access_token'];
        final newRefreshToken = response.data['refresh_token'];
        await AuthService.instance.saveTokens(
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        );
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<Response<dynamic>> _retryRequest(RequestOptions options) async {
    final token = await AuthService.instance.getAccessToken();
    options.headers['Authorization'] = 'Bearer $token';

    return Dio().fetch(options);
  }
}
```

**lib/core/network/interceptors/error_interceptor.dart**:
```dart
import 'package:dio/dio.dart';
import '../exceptions/api_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final apiException = _handleError(err);
    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: apiException,
        response: err.response,
        type: err.type,
      ),
    );
  }

  ApiException _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timed out. Please try again.',
          statusCode: null,
        );

      case DioExceptionType.connectionError:
        return ApiException(
          message: 'No internet connection.',
          statusCode: null,
        );

      case DioExceptionType.badResponse:
        return _handleBadResponse(error.response);

      case DioExceptionType.cancel:
        return ApiException(
          message: 'Request was cancelled.',
          statusCode: null,
        );

      default:
        return ApiException(
          message: 'An unexpected error occurred.',
          statusCode: null,
        );
    }
  }

  ApiException _handleBadResponse(Response? response) {
    final statusCode = response?.statusCode;
    final data = response?.data;

    String message;
    if (data is Map && data.containsKey('message')) {
      message = data['message'];
    } else {
      message = _getDefaultMessage(statusCode);
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      errors: data is Map ? data['errors'] : null,
    );
  }

  String _getDefaultMessage(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error.';
      case 429:
        return 'Too many requests. Please wait.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred.';
    }
  }
}
```

**lib/core/network/interceptors/retry_interceptor.dart**:
```dart
import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  final Dio dio;
  final int maxRetries;
  final Duration retryDelay;

  RetryInterceptor({
    required this.dio,
    this.maxRetries = 3,
    this.retryDelay = const Duration(seconds: 1),
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Only retry on network errors, not on 4xx/5xx responses
    if (_shouldRetry(err)) {
      final retryCount = err.requestOptions.extra['retryCount'] ?? 0;

      if (retryCount < maxRetries) {
        await Future.delayed(retryDelay * (retryCount + 1));

        err.requestOptions.extra['retryCount'] = retryCount + 1;

        try {
          final response = await dio.fetch(err.requestOptions);
          return handler.resolve(response);
        } catch (e) {
          return handler.next(err);
        }
      }
    }

    handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError;
  }
}
```

### 4. API Exception

**lib/core/network/exceptions/api_exception.dart**:
```dart
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic errors;

  ApiException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 422;
  bool get isServerError => statusCode != null && statusCode! >= 500;
}
```

### 5. Retrofit Setup

**lib/core/network/api/api_service.dart**:
```dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../../features/user/data/models/user_model.dart';
import '../../../features/product/data/models/product_model.dart';

part 'api_service.g.dart';

@RestApi()
abstract class ApiService {
  factory ApiService(Dio dio, {String? baseUrl}) = _ApiService;

  // Authentication
  @POST('/auth/login')
  Future<AuthResponse> login(@Body() LoginRequest request);

  @POST('/auth/register')
  Future<AuthResponse> register(@Body() RegisterRequest request);

  @POST('/auth/logout')
  Future<void> logout();

  // Users
  @GET('/users/me')
  Future<UserModel> getCurrentUser();

  @PUT('/users/me')
  Future<UserModel> updateProfile(@Body() UpdateProfileRequest request);

  @GET('/users/{id}')
  Future<UserModel> getUser(@Path('id') String id);

  // Products
  @GET('/products')
  Future<PaginatedResponse<ProductModel>> getProducts({
    @Query('page') int? page,
    @Query('limit') int? limit,
    @Query('category') String? category,
    @Query('search') String? search,
  });

  @GET('/products/{id}')
  Future<ProductModel> getProduct(@Path('id') String id);

  @POST('/products')
  Future<ProductModel> createProduct(@Body() CreateProductRequest request);

  @PUT('/products/{id}')
  Future<ProductModel> updateProduct(
    @Path('id') String id,
    @Body() UpdateProductRequest request,
  );

  @DELETE('/products/{id}')
  Future<void> deleteProduct(@Path('id') String id);

  // File upload
  @POST('/upload')
  @MultiPart()
  Future<UploadResponse> uploadFile(@Part(name: 'file') File file);
}
```

Generate code:
```bash
dart run build_runner build --delete-conflicting-outputs
```

### 6. Response Models

**lib/core/network/models/paginated_response.dart**:
```dart
import 'package:json_annotation/json_annotation.dart';

part 'paginated_response.g.dart';

@JsonSerializable(genericArgumentFactories: true)
class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int limit;
  final int totalPages;

  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) =>
      _$PaginatedResponseFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
      _$PaginatedResponseToJson(this, toJsonT);

  bool get hasMore => page < totalPages;
}
```

### 7. Network Connectivity

**lib/core/network/connectivity_service.dart**:
```dart
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();

  Stream<bool> get onConnectivityChanged =>
      _connectivity.onConnectivityChanged.map(_isConnected);

  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return _isConnected(result);
  }

  bool _isConnected(List<ConnectivityResult> result) {
    return result.isNotEmpty && !result.contains(ConnectivityResult.none);
  }
}
```

### 8. Response Caching

**lib/core/network/interceptors/cache_interceptor.dart**:
```dart
import 'package:dio/dio.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';

class CacheConfig {
  static CacheOptions get options => CacheOptions(
        store: MemCacheStore(maxSize: 10485760, maxEntrySize: 1048576),
        policy: CachePolicy.request,
        hitCacheOnErrorExcept: [401, 403],
        maxStale: const Duration(days: 7),
        priority: CachePriority.normal,
        cipher: null,
        keyBuilder: CacheOptions.defaultCacheKeyBuilder,
        allowPostMethod: false,
      );

  static DioCacheInterceptor get interceptor =>
      DioCacheInterceptor(options: options);
}

// Usage
final dio = Dio()
  ..interceptors.add(CacheConfig.interceptor);

// Force refresh (bypass cache)
final response = await dio.get(
  '/products',
  options: CacheConfig.options.copyWith(policy: CachePolicy.refresh).toOptions(),
);
```

### 9. Mock Client for Testing

**test/mocks/mock_dio_client.dart**:
```dart
import 'package:dio/dio.dart';
import 'package:mocktail/mocktail.dart';

class MockDio extends Mock implements Dio {}

class MockDioClient {
  final MockDio mockDio = MockDio();

  void setupGetSuccess<T>(String path, T responseData) {
    when(() => mockDio.get<T>(
          path,
          queryParameters: any(named: 'queryParameters'),
          options: any(named: 'options'),
        )).thenAnswer(
      (_) async => Response(
        data: responseData,
        statusCode: 200,
        requestOptions: RequestOptions(path: path),
      ),
    );
  }

  void setupGetError(String path, int statusCode, String message) {
    when(() => mockDio.get(
          path,
          queryParameters: any(named: 'queryParameters'),
          options: any(named: 'options'),
        )).thenThrow(
      DioException(
        response: Response(
          statusCode: statusCode,
          data: {'message': message},
          requestOptions: RequestOptions(path: path),
        ),
        requestOptions: RequestOptions(path: path),
        type: DioExceptionType.badResponse,
      ),
    );
  }

  void setupPostSuccess<T>(String path, T responseData) {
    when(() => mockDio.post<T>(
          path,
          data: any(named: 'data'),
          options: any(named: 'options'),
        )).thenAnswer(
      (_) async => Response(
        data: responseData,
        statusCode: 201,
        requestOptions: RequestOptions(path: path),
      ),
    );
  }
}
```

### 10. Repository Pattern

**lib/features/product/data/repositories/product_repository.dart**:
```dart
import '../../../core/network/api/api_service.dart';
import '../models/product_model.dart';

abstract class ProductRepository {
  Future<List<ProductModel>> getProducts({int page = 1, int limit = 20});
  Future<ProductModel> getProduct(String id);
  Future<ProductModel> createProduct(CreateProductRequest request);
  Future<ProductModel> updateProduct(String id, UpdateProductRequest request);
  Future<void> deleteProduct(String id);
}

class ProductRepositoryImpl implements ProductRepository {
  final ApiService _apiService;

  ProductRepositoryImpl(this._apiService);

  @override
  Future<List<ProductModel>> getProducts({int page = 1, int limit = 20}) async {
    final response = await _apiService.getProducts(page: page, limit: limit);
    return response.data;
  }

  @override
  Future<ProductModel> getProduct(String id) async {
    return _apiService.getProduct(id);
  }

  @override
  Future<ProductModel> createProduct(CreateProductRequest request) async {
    return _apiService.createProduct(request);
  }

  @override
  Future<ProductModel> updateProduct(
    String id,
    UpdateProductRequest request,
  ) async {
    return _apiService.updateProduct(id, request);
  }

  @override
  Future<void> deleteProduct(String id) async {
    await _apiService.deleteProduct(id);
  }
}
```

### 11. Dependency Injection

**With Riverpod**:
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient(baseUrl: AppConfig.instance.baseUrl);
});

final apiServiceProvider = Provider<ApiService>((ref) {
  final dio = ref.watch(dioClientProvider).dio;
  return ApiService(dio);
});

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ProductRepositoryImpl(apiService);
});
```

### 12. Output Summary

```
Networking Setup Complete
=========================

Dependencies Added:
- dio: ^5.7.0
- retrofit: ^4.4.1
- json_annotation: ^4.9.0
- pretty_dio_logger: ^1.4.0
- connectivity_plus: ^6.1.0
- dio_cache_interceptor: ^3.5.0

Files Created:
- lib/core/network/dio_client.dart
- lib/core/network/api/api_service.dart
- lib/core/network/interceptors/auth_interceptor.dart
- lib/core/network/interceptors/error_interceptor.dart
- lib/core/network/interceptors/retry_interceptor.dart
- lib/core/network/exceptions/api_exception.dart
- lib/core/network/connectivity_service.dart

Features Configured:
- Base Dio client with configurable options
- Authentication interceptor with token refresh
- Error handling with custom exceptions
- Retry logic for network errors
- Response caching
- Request/response logging

Generate Code:
dart run build_runner build --delete-conflicting-outputs

Next Steps:
1. Define API endpoints in ApiService
2. Create request/response models
3. Implement repositories
4. Set up dependency injection
```

## Agent Reference

For architecture decisions around networking layers, consult the `flutter-architect` agent. For code generation patterns, consult the `flutter-codegen-assistant` agent.
